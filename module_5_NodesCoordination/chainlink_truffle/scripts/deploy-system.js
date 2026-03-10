const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const { ethers, network } = require("hardhat");

function env(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

function requiredEnv(name) {
  const value = env(name);
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function normalizeHex(value) {
  if (!value) return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

function parseAddressList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function assertAllAddresses(addrs, label) {
  for (const addr of addrs) {
    if (!ethers.isAddress(addr)) {
      throw new Error(`Invalid address in ${label}: ${addr}`);
    }
  }
}

function uuidToBytes32(uuid) {
  const hex = uuid.replaceAll("-", "").trim().toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error(
      `Invalid external job ID (expected UUID): ${uuid}. After removing dashes it must be 32 hex chars.`,
    );
  }
  return `0x${hex}${"0".repeat(32)}`;
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function isNonEmptyHexData(value) {
  return (
    typeof value === "string" &&
    ethers.isHexString(value) &&
    value.length > 2 &&
    !value.includes("...")
  );
}

function generateOcrConfigViaGo(ocrConfigFile) {
  const chainlinkGoDir = path.resolve(__dirname, "..", "..", "chainlink_go");
  const generatorPath = "./core/internal/encodeGenerator.go";
  const resolvedConfigFile = path.isAbsolute(ocrConfigFile)
    ? ocrConfigFile
    : path.resolve(process.cwd(), ocrConfigFile);

  let stdout;
  try {
    stdout = execFileSync(
      "go",
      ["run", generatorPath, "-config", resolvedConfigFile, "-format", "json"],
      { cwd: chainlinkGoDir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (e) {
    const stderr = e && e.stderr ? String(e.stderr) : "";
    throw new Error(
      `Failed to generate OCR encoded config via Go.\n` +
        `Tried: (cd ${chainlinkGoDir} && go run ${generatorPath} -config ${resolvedConfigFile} -format json)\n` +
        (stderr ? `Go stderr:\n${stderr}\n` : "") +
        `Make sure Go is installed and the config file is valid.`,
    );
  }

  try {
    return JSON.parse(stdout.trim());
  } catch {
    throw new Error(
      `Go generator returned non-JSON output:\n${stdout}\n` +
        `Check your config file and try again.`,
    );
  }
}

function loadBundledOcrPreset(preset) {
  if (preset === "diabolik4") {
    return path.resolve(__dirname, "..", "ocr-config.diabolik4.json");
  }
  if (preset === "diabolik10") {
    return path.resolve(__dirname, "..", "ocr-config.diabolik10.json");
  }
  if (preset === "example") {
    return path.resolve(__dirname, "..", "ocr-config.example.json");
  }
  return "";
}

function normalizeAddressList(list) {
  return (list || []).map((a) => a.toLowerCase()).sort();
}

function tryAutoPresetFromLists({ signers, transmitters }) {
  const presetFile = loadBundledOcrPreset("diabolik4");
  try {
    const raw = fs.readFileSync(presetFile, "utf8");
    const cfg = JSON.parse(raw);
    const presetSigners = normalizeAddressList(
      (cfg.oracles || []).map((o) => o.onChainSigningAddress),
    );
    const presetTransmitters = normalizeAddressList(
      (cfg.oracles || []).map((o) => o.transmitAddress),
    );
    if (
      JSON.stringify(normalizeAddressList(signers)) === JSON.stringify(presetSigners) &&
      JSON.stringify(normalizeAddressList(transmitters)) ===
        JSON.stringify(presetTransmitters)
    ) {
      return presetFile;
    }
  } catch {
    // Ignore and fall through
  }
  return "";
}

async function main() {
  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error(
      `No deployer account is configured for network "${network.name}". ` +
        `Set DEPLOYER_PRIVATE_KEY (recommended) or MNEMONIC in ` +
        `"DIABOLIK-Master-Thesis/chainlink_truffle/.env", then re-run the deploy.`,
    );
  }
  const deployer = signers[0];
  const chainId = Number((await deployer.provider.getNetwork()).chainId);

  const linkTokenAddress = (
    env("LINK_TOKEN_ADDRESS") ||
    env("LINK_CONTRACT_ADDRESS") ||
    env("LINK_ADDRESS") ||
    ""
  ).trim();
  if (!ethers.isAddress(linkTokenAddress)) {
    throw new Error(
      `Missing/invalid LINK token address. Set LINK_TOKEN_ADDRESS (or LINK_CONTRACT_ADDRESS). Got: ${linkTokenAddress}`,
    );
  }

  const externalJobId =
    env("DR_EXTERNAL_JOB_ID", "142ff888-5ecb-4152-a449-69de0b419e9e") || "";
  const jobIdBytes32 =
    normalizeHex(env("DR_JOB_ID_BYTES32")) || uuidToBytes32(externalJobId);

  const dataFetchCostJuels = env("DR_PAYMENT_JUELS", "1000000000000000000"); // 1 LINK
  const linkPerWei = env("LINK_PER_WEI", "190");
  const maxReqTimeSeconds = env("MAX_REQ_TIME_SECONDS", "120");
  const gamblingInitialEthWei = env("GAMBLING_INITIAL_ETH_WEI", "1000");
  const deployerSelfMonthlyLimitWei = env(
    "DEPLOYER_SELF_MONTHLY_LIMIT_WEI",
    "10000000000000",
  );

  const gamblingDapps = parseAddressList(env("GAMBLING_DAPPS", ""));
  assertAllAddresses(gamblingDapps, "GAMBLING_DAPPS");

  const skipOcrConfig = env("SKIP_OCR_CONFIG", "false").toLowerCase() === "true";

  const ocrConfigPreset = env("OCR_CONFIG_PRESET", "");
  let ocrConfigFile = env("OCR_CONFIG_FILE", "");
  if (!ocrConfigFile && ocrConfigPreset) {
    const resolvedPreset = loadBundledOcrPreset(ocrConfigPreset);
    if (resolvedPreset) {
      ocrConfigFile = resolvedPreset;
    } else {
      throw new Error(
        `Unknown OCR_CONFIG_PRESET: ${ocrConfigPreset}. Supported: diabolik4, diabolik10, example`,
      );
    }
  }
  let generatedOcr = null;

  let ocrTransmitters = parseAddressList(env("OCR_TRANSMITTERS", ""));
  let ocrSigners = parseAddressList(env("OCR_SIGNERS", ""));
  let ocrPayees = parseAddressList(env("OCR_PAYEES", "")) || [];

  const ocrConfigVersionRaw = process.env.OCR_ENCODED_CONFIG_VERSION;
  const ocrThresholdRaw = process.env.OCR_THRESHOLD;
  const ocrEncodedConfigRaw = process.env.OCR_ENCODED_CONFIG;

  let ocrConfigVersion = env("OCR_ENCODED_CONFIG_VERSION", "1");
  let ocrThreshold = env("OCR_THRESHOLD", "1");
  let ocrEncodedConfig = normalizeHex(env("OCR_ENCODED_CONFIG", ""));

  const hasValidOcrEncodedConfig = isNonEmptyHexData(ocrEncodedConfig);
  if (!skipOcrConfig && !hasValidOcrEncodedConfig) {
    if (!ocrConfigFile) {
      const autoPreset = tryAutoPresetFromLists({
        signers: ocrSigners,
        transmitters: ocrTransmitters,
      });
      if (autoPreset) {
        ocrConfigFile = autoPreset;
      }
    }
    if (!ocrConfigFile) {
      throw new Error(
        `Invalid OCR_ENCODED_CONFIG (it looks empty or like a placeholder: "${ocrEncodedConfigRaw || ""}"). ` +
          `Set OCR_ENCODED_CONFIG to a real hex string, or set OCR_CONFIG_FILE / OCR_CONFIG_PRESET so it can be generated automatically.`,
      );
    }
    generatedOcr = generateOcrConfigViaGo(ocrConfigFile);
    ocrEncodedConfig = generatedOcr.encodedConfig;
    if (!ocrConfigVersionRaw) {
      ocrConfigVersion = String(generatedOcr.encodedConfigVersion);
    }
    if (!ocrThresholdRaw) {
      ocrThreshold = String(generatedOcr.f);
    }
    if (ocrTransmitters.length === 0) {
      ocrTransmitters = generatedOcr.transmitters || [];
    }
    if (ocrSigners.length === 0) {
      ocrSigners = generatedOcr.signers || [];
    }
  }

  if (!skipOcrConfig) {
    if (ocrTransmitters.length === 0) {
      throw new Error(
        "Missing OCR_TRANSMITTERS (comma-separated list of transmitter addresses), and generator output did not provide any.",
      );
    }
    if (ocrSigners.length === 0) {
      throw new Error(
        "Missing OCR_SIGNERS (comma-separated list of signer addresses), and generator output did not provide any.",
      );
    }
    if (ocrSigners.length !== ocrTransmitters.length) {
      throw new Error(
        `OCR_SIGNERS length (${ocrSigners.length}) must match OCR_TRANSMITTERS length (${ocrTransmitters.length}).`,
      );
    }
    if (!ocrEncodedConfig || ocrEncodedConfig === "0x") {
      throw new Error(
        "Missing OCR_ENCODED_CONFIG and generator did not produce a valid value.",
      );
    }
  }

  assertAllAddresses(ocrTransmitters, "OCR_TRANSMITTERS");
  assertAllAddresses(ocrSigners, "OCR_SIGNERS");
  assertAllAddresses(ocrPayees.length ? ocrPayees : ocrTransmitters, "OCR_PAYEES");

  const ocrMaxRequestLinkCost = env(
    "OCR_MAX_REQUEST_LINK_COST_JUELS",
    "15500000000000000000",
  ); // 15.5 LINK

  const ocr = {
    maximumGasPrice: Number(env("OCR_MAXIMUM_GAS_PRICE", "3000")),
    reasonableGasPrice: Number(env("OCR_REASONABLE_GAS_PRICE", "100")),
    microLinkPerEth: Number(env("OCR_MICROLINK_PER_ETH", "128900000")),
    linkGweiPerObservation: Number(env("OCR_LINK_GWEI_PER_OBSERVATION", "2000000000")),
    linkGweiPerTransmission: Number(env("OCR_LINK_GWEI_PER_TRANSMISSION", "100000000")),
    minAnswer: env("OCR_MIN_ANSWER", "0"),
    maxAnswer: env("OCR_MAX_ANSWER", "10"),
    decimals: Number(env("OCR_DECIMALS", "5")),
    description: env("OCR_DESCRIPTION", "DIABOLIK OCR"),
  };

  console.log(`Network: ${network.name} (chainId=${chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const Operator = await ethers.getContractFactory("Operator");
  const RequestManager = await ethers.getContractFactory("RequestManager");
  const AccessController = await ethers.getContractFactory("AccessController");
  const DepositLimitation = await ethers.getContractFactory("DepositLimitation");
  const Gambling = await ethers.getContractFactory("Gambling");
  const OffchainAggregator = await ethers.getContractFactory("OffchainAggregator");

  const operator = await Operator.deploy(linkTokenAddress, deployer.address);
  await operator.waitForDeployment();
  console.log(`Operator: ${operator.target}`);

  if (ocrTransmitters.length) {
    const tx = await operator.setAuthorizedSenders(ocrTransmitters);
    await tx.wait();
  }

  const requestManager = await RequestManager.deploy(
    dataFetchCostJuels,
    operator.target,
    jobIdBytes32,
    linkTokenAddress,
  );
  await requestManager.waitForDeployment();
  console.log(`RequestManager: ${requestManager.target}`);

  const accessController = await AccessController.deploy();
  await accessController.waitForDeployment();
  console.log(`AccessController: ${accessController.target}`);

  await (await accessController.addAccess(requestManager.target)).wait();
  await (await accessController.addAccess(deployer.address)).wait();

  const depositLimitation = await DepositLimitation.deploy();
  await depositLimitation.waitForDeployment();
  console.log(`DepositLimitation: ${depositLimitation.target}`);

  if (gamblingDapps.length) {
    await (await depositLimitation.setGamblingDapps(gamblingDapps)).wait();
  }
  await (
    await depositLimitation.setMonthlySelfLimitation(deployerSelfMonthlyLimitWei)
  ).wait();

  const gambling = await Gambling.deploy(
    requestManager.target,
    linkPerWei,
    linkTokenAddress,
    depositLimitation.target,
    { value: gamblingInitialEthWei },
  );
  await gambling.waitForDeployment();
  console.log(`Gambling: ${gambling.target}`);

  const ocrContract = await OffchainAggregator.deploy(
    ocr.maximumGasPrice,
    ocr.reasonableGasPrice,
    ocr.microLinkPerEth,
    ocr.linkGweiPerObservation,
    ocr.linkGweiPerTransmission,
    linkTokenAddress,
    ocr.minAnswer,
    ocr.maxAnswer,
    accessController.target,
    accessController.target,
    ocr.decimals,
    ocr.description,
  );
  await ocrContract.waitForDeployment();
  console.log(`OffchainAggregator: ${ocrContract.target}`);

  await (await ocrContract.setMaxrequestLinkTonken(ocrMaxRequestLinkCost)).wait();
  await (await ocrContract.setRequestManager(requestManager.target)).wait();

  if (!skipOcrConfig) {
    const payees = ocrPayees.length ? ocrPayees : ocrTransmitters;
    await (await ocrContract.setPayees(ocrTransmitters, payees)).wait();
    await (
      await ocrContract.setConfig(
        ocrSigners,
        ocrTransmitters,
        ocrThreshold,
        ocrConfigVersion,
        ocrEncodedConfig,
      )
    ).wait();
  }

  await (await requestManager.setOCRcontract(ocrContract.target)).wait();
  await (await requestManager.setMaxReqTime(maxReqTimeSeconds)).wait();
  await (await gambling.approveLink(env("GAMBLING_APPROVE_LINK_JUELS", "150000000000000000000"))).wait();

  const out = {
    network: network.name,
    chainId,
    deployer: deployer.address,
    linkToken: linkTokenAddress,
    operator: operator.target,
    requestManager: requestManager.target,
    accessController: accessController.target,
    depositLimitation: depositLimitation.target,
    gambling: gambling.target,
    offchainAggregator: ocrContract.target,
    directRequestExternalJobId: externalJobId,
    directRequestJobIdBytes32: jobIdBytes32,
  };

  const deploymentsPath = path.resolve(
    __dirname,
    "..",
    "deployments",
    `system.${network.name}.json`,
  );
  writeJson(deploymentsPath, out);
  console.log(`Saved deployment addresses: ${deploymentsPath}`);

  const fundGamblingLinkJuels = env("FUND_GAMBLING_LINK_JUELS", "100000000000000000000"); // 100 LINK
  if (fundGamblingLinkJuels !== "0") {
    const link = await ethers.getContractAt(
      "contracts/ocr-lib/LinkTokenInterface.sol:LinkTokenInterface",
      linkTokenAddress,
    );
    const balance = await link.balanceOf(deployer.address);
    if (balance < BigInt(fundGamblingLinkJuels)) {
      console.log(
        `Skipping LINK funding: deployer LINK balance (${balance}) is less than FUND_GAMBLING_LINK_JUELS (${fundGamblingLinkJuels}).`,
      );
      console.log(
        `Fund this address with Sepolia LINK (it is the account sending LINK transfers): ${deployer.address}`,
      );
      console.log(
        `Then run: npx hardhat run scripts/deploy-system-part2.js --network ${network.name} (with the addresses from ${deploymentsPath}).`,
      );
    } else {
      await (await link.transfer(gambling.target, fundGamblingLinkJuels)).wait();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
