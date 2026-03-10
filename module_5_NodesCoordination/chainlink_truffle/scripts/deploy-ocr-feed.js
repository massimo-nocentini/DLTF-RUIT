const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const { ethers, network } = require("hardhat");

function env(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") return fallback;
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

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
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

async function main() {
  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error(
      `No deployer account is configured for network "${network.name}". ` +
        `Set DEPLOYER_PRIVATE_KEY (recommended) or MNEMONIC in ` +
        `"DIABOLIK-Master-Thesis/chainlink_truffle/.env", then re-run.`,
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

  const ocrConfigPreset = env("OCR_CONFIG_PRESET", "");
  let ocrConfigFile = env("OCR_CONFIG_FILE", "");
  if (!ocrConfigFile && ocrConfigPreset) {
    if (ocrConfigPreset === "diabolik4") {
      ocrConfigFile = path.resolve(__dirname, "..", "ocr-config.diabolik4.json");
    } else if (ocrConfigPreset === "diabolik10") {
      ocrConfigFile = path.resolve(__dirname, "..", "ocr-config.diabolik10.json");
    } else if (ocrConfigPreset === "example") {
      ocrConfigFile = path.resolve(__dirname, "..", "ocr-config.example.json");
    } else {
      throw new Error(
        `Unknown OCR_CONFIG_PRESET: ${ocrConfigPreset}. Supported: diabolik4, diabolik10, example`,
      );
    }
  }

  let ocrTransmitters = parseAddressList(env("OCR_TRANSMITTERS", ""));
  let ocrSigners = parseAddressList(env("OCR_SIGNERS", ""));
  let ocrPayees = parseAddressList(env("OCR_PAYEES", "")) || [];

  const ocrConfigVersionRaw = process.env.OCR_ENCODED_CONFIG_VERSION;
  const ocrThresholdRaw = process.env.OCR_THRESHOLD;
  const ocrEncodedConfigRaw = process.env.OCR_ENCODED_CONFIG;

  let ocrConfigVersion = env("OCR_ENCODED_CONFIG_VERSION", "1");
  let ocrThreshold = env("OCR_THRESHOLD", "1");
  let ocrEncodedConfig = normalizeHex(env("OCR_ENCODED_CONFIG", ""));

  const missingEncoded =
    !ocrEncodedConfig ||
    ocrEncodedConfig === "0x" ||
    ocrEncodedConfig === "0x..." ||
    ocrEncodedConfigRaw === "0x...";

  if (missingEncoded) {
    if (!ocrConfigFile) {
      throw new Error(
        "Missing OCR_ENCODED_CONFIG. Provide OCR_ENCODED_CONFIG, or set OCR_CONFIG_FILE to a JSON file so it can be generated automatically.",
      );
    }
    const generated = generateOcrConfigViaGo(ocrConfigFile);
    ocrEncodedConfig = generated.encodedConfig;
    if (!ocrConfigVersionRaw) {
      ocrConfigVersion = String(generated.encodedConfigVersion);
    }
    if (!ocrThresholdRaw) {
      ocrThreshold = String(generated.f);
    }
    if (ocrTransmitters.length === 0) {
      ocrTransmitters = generated.transmitters || [];
    }
    if (ocrSigners.length === 0) {
      ocrSigners = generated.signers || [];
    }
  }

  if (ocrTransmitters.length === 0) {
    throw new Error(
      "Missing OCR_TRANSMITTERS (comma-separated list), and generator output did not provide any.",
    );
  }
  if (ocrSigners.length === 0) {
    throw new Error(
      "Missing OCR_SIGNERS (comma-separated list), and generator output did not provide any.",
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

  assertAllAddresses(ocrTransmitters, "OCR_TRANSMITTERS");
  assertAllAddresses(ocrSigners, "OCR_SIGNERS");
  assertAllAddresses(ocrPayees.length ? ocrPayees : ocrTransmitters, "OCR_PAYEES");

  const ocr = {
    maximumGasPrice: Number(env("OCR_MAXIMUM_GAS_PRICE", "3000")),
    reasonableGasPrice: Number(env("OCR_REASONABLE_GAS_PRICE", "100")),
    microLinkPerEth: Number(env("OCR_MICROLINK_PER_ETH", "128900000")),
    linkGweiPerObservation: Number(env("OCR_LINK_GWEI_PER_OBSERVATION", "0")),
    linkGweiPerTransmission: Number(env("OCR_LINK_GWEI_PER_TRANSMISSION", "0")),
    minAnswer: env("OCR_MIN_ANSWER", "0"),
    maxAnswer: env("OCR_MAX_ANSWER", "1000000000"),
    decimals: Number(env("OCR_DECIMALS", "0")),
    description: env("OCR_DESCRIPTION", "DIABOLIK SUM OCR"),
  };

  const maxRequestLinkCostJuels = env("OCR_MAX_REQUEST_LINK_COST_JUELS", "1");

  console.log(`Network: ${network.name} (chainId=${chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const AccessController = await ethers.getContractFactory("AccessController");
  const OffchainAggregator = await ethers.getContractFactory("OffchainAggregator");

  const accessController = await AccessController.deploy();
  await accessController.waitForDeployment();
  console.log(`AccessController: ${accessController.target}`);

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

  await (await ocrContract.setTrackerEnabled(false)).wait();
  await (await ocrContract.setMaxrequestLinkTonken(maxRequestLinkCostJuels)).wait();

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

  const out = {
    network: network.name,
    chainId,
    deployer: deployer.address,
    linkToken: linkTokenAddress,
    accessController: accessController.target,
    offchainAggregator: ocrContract.target,
    trackerEnabled: false,
  };

  const deploymentsPath = path.resolve(
    __dirname,
    "..",
    "deployments",
    `ocr-feed.${network.name}.json`,
  );
  writeJson(deploymentsPath, out);
  console.log(`Saved deployment addresses: ${deploymentsPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
