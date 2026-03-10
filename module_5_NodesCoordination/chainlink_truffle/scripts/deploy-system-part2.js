const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const { ethers, network } = require("hardhat");

function env(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

function parseAddressList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeHex(value) {
  if (!value) return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
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

function loadAddresses() {
  const file = env("SYSTEM_ADDRESSES_FILE", "");
  if (file) {
    const resolved = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
    const parsed = JSON.parse(fs.readFileSync(resolved, "utf8"));
    return parsed;
  }

  return {
    operator: env("OPERATOR_ADDRESS", ""),
    requestManager: env("REQUEST_MANAGER_ADDRESS", ""),
    accessController: env("ACCESS_CONTROLLER_ADDRESS", ""),
    depositLimitation: env("DEPOSIT_LIMITATION_ADDRESS", ""),
    gambling: env("GAMBLING_ADDRESS", ""),
    offchainAggregator: env("OCR_ADDRESS", ""),
  };
}

function assertAddress(addr, label) {
  if (!ethers.isAddress(addr)) {
    throw new Error(`Missing/invalid ${label}: ${addr}`);
  }
}

async function safeTx(label, fn) {
  try {
    const tx = await fn();
    const receipt = await tx.wait();
    console.log(`${label}: ok (tx=${receipt.hash})`);
    return true;
  } catch (err) {
    const message = err && err.shortMessage ? err.shortMessage : err?.message || String(err);
    console.log(`${label}: skipped/failed (${message})`);
    return false;
  }
}

async function main() {
  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error(
      `No deployer account is configured for network "${network.name}". Set DEPLOYER_PRIVATE_KEY or MNEMONIC in ".env".`,
    );
  }
  const deployer = signers[0];
  const chainId = Number((await deployer.provider.getNetwork()).chainId);

  console.log(`Network: ${network.name} (chainId=${chainId})`);
  console.log(`Deployer: ${deployer.address}`);

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

  const addrs = loadAddresses();
  assertAddress(addrs.operator, "OPERATOR_ADDRESS");
  assertAddress(addrs.requestManager, "REQUEST_MANAGER_ADDRESS");
  assertAddress(addrs.accessController, "ACCESS_CONTROLLER_ADDRESS");
  assertAddress(addrs.depositLimitation, "DEPOSIT_LIMITATION_ADDRESS");
  assertAddress(addrs.gambling, "GAMBLING_ADDRESS");
  assertAddress(addrs.offchainAggregator, "OCR_ADDRESS");

  const Operator = await ethers.getContractAt("Operator", addrs.operator);
  const RequestManager = await ethers.getContractAt("RequestManager", addrs.requestManager);
  const AccessController = await ethers.getContractAt("AccessController", addrs.accessController);
  const Gambling = await ethers.getContractAt("Gambling", addrs.gambling);
  const OCR = await ethers.getContractAt("OffchainAggregator", addrs.offchainAggregator);
  const link = await ethers.getContractAt(
    "contracts/ocr-lib/LinkTokenInterface.sol:LinkTokenInterface",
    linkTokenAddress,
  );

  // (Re-)apply operator authorized senders if provided.
  const ocrTransmitters = parseAddressList(env("OCR_TRANSMITTERS", ""));
  if (ocrTransmitters.length) {
    const existing = await Operator.getAuthorizedSenders();
    const same =
      JSON.stringify(existing.map((a) => a.toLowerCase()).sort()) ===
      JSON.stringify(ocrTransmitters.map((a) => a.toLowerCase()).sort());
    if (!same) {
      await safeTx("Operator.setAuthorizedSenders", () =>
        Operator.setAuthorizedSenders(ocrTransmitters),
      );
    }
  }

  // Ensure AccessController allows RequestManager and deployer.
  if (!(await AccessController.accessList(addrs.requestManager))) {
    await safeTx("AccessController.addAccess(RequestManager)", () =>
      AccessController.addAccess(addrs.requestManager),
    );
  }
  if (!(await AccessController.accessList(deployer.address))) {
    await safeTx("AccessController.addAccess(deployer)", () =>
      AccessController.addAccess(deployer.address),
    );
  }

  // Wire OCR <-> RequestManager
  await safeTx("OCR.setRequestManager", () => OCR.setRequestManager(addrs.requestManager));
  await safeTx("RequestManager.setOCRcontract", () =>
    RequestManager.setOCRcontract(addrs.offchainAggregator),
  );

  const maxReqTimeSeconds = env("MAX_REQ_TIME_SECONDS", "120");
  await safeTx("RequestManager.setMaxReqTime", () => RequestManager.setMaxReqTime(maxReqTimeSeconds));

  const ocrMaxRequestLinkCost = env(
    "OCR_MAX_REQUEST_LINK_COST_JUELS",
    "15500000000000000000",
  );
  await safeTx("OCR.setMaxrequestLinkTonken", () =>
    OCR.setMaxrequestLinkTonken(ocrMaxRequestLinkCost),
  );

  // OCR config (optional: skip if already configured)
  const skipOcrConfig = env("SKIP_OCR_CONFIG", "false").toLowerCase() === "true";
  if (!skipOcrConfig) {
    const [configCount] = await OCR.latestConfigDetails();
    if (Number(configCount) === 0) {
      const ocrConfigVersionRaw = process.env.OCR_ENCODED_CONFIG_VERSION;
      const ocrThresholdRaw = process.env.OCR_THRESHOLD;

      let ocrConfigVersion = env("OCR_ENCODED_CONFIG_VERSION", "1");
      let ocrThreshold = env("OCR_THRESHOLD", "1");
      let ocrEncodedConfig = normalizeHex(env("OCR_ENCODED_CONFIG", ""));

      if (!isNonEmptyHexData(ocrEncodedConfig)) {
        const ocrConfigFile = env("OCR_CONFIG_FILE", "");
        if (!ocrConfigFile) {
          throw new Error(
            "OCR is not configured yet. Provide OCR_ENCODED_CONFIG, or set OCR_CONFIG_FILE so it can be generated.",
          );
        }
        const generated = generateOcrConfigViaGo(ocrConfigFile);
        ocrEncodedConfig = generated.encodedConfig;
        if (!ocrConfigVersionRaw) ocrConfigVersion = String(generated.encodedConfigVersion);
        if (!ocrThresholdRaw) ocrThreshold = String(generated.f);
      }

      const ocrSigners = parseAddressList(env("OCR_SIGNERS", ""));
      const transmitters = ocrTransmitters;
      if (!ocrSigners.length || !transmitters.length) {
        throw new Error(
          "To configure OCR, set OCR_SIGNERS and OCR_TRANSMITTERS (or provide them via the Go JSON and set them in env).",
        );
      }

      const payees = parseAddressList(env("OCR_PAYEES", "")) || [];
      await safeTx("OCR.setPayees", () => OCR.setPayees(transmitters, payees.length ? payees : transmitters));
      await safeTx("OCR.setConfig", () =>
        OCR.setConfig(ocrSigners, transmitters, ocrThreshold, ocrConfigVersion, ocrEncodedConfig),
      );
    } else {
      console.log(`OCR already configured (configCount=${configCount}).`);
    }
  }

  // Gambling approves RequestManager to pull LINK
  const approveAmount = env("GAMBLING_APPROVE_LINK_JUELS", "150000000000000000000");
  await safeTx("Gambling.approveLink", () => Gambling.approveLink(approveAmount));

  // Fund Gambling with LINK (deployer -> Gambling)
  const fundGamblingLinkJuels = env("FUND_GAMBLING_LINK_JUELS", "100000000000000000000");
  if (fundGamblingLinkJuels !== "0") {
    const bal = await link.balanceOf(deployer.address);
    if (bal < BigInt(fundGamblingLinkJuels)) {
      console.log(
        `Skipping LINK funding: deployer LINK balance (${bal}) is less than FUND_GAMBLING_LINK_JUELS (${fundGamblingLinkJuels}).`,
      );
      console.log(
        `Fund this address with Sepolia LINK: ${deployer.address} (it is the account sending LINK transfers).`,
      );
    } else {
      await safeTx("LINK.transfer(Gambling)", () => link.transfer(addrs.gambling, fundGamblingLinkJuels));
    }
  }

  console.log("Part2 complete.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

