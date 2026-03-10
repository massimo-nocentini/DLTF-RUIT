const fs = require("fs");
const path = require("path");

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

  const drPaymentJuels = env("DR_PAYMENT_JUELS", "1000000000000000000"); // 1 LINK
  const linkPerWei = env("LINK_PER_WEI", "190");
  const gamblingInitialEthWei = env("GAMBLING_INITIAL_ETH_WEI", "1000");
  const deployerSelfMonthlyLimitWei = env(
    "DEPLOYER_SELF_MONTHLY_LIMIT_WEI",
    "10000000000000",
  );

  const gamblingDapps = parseAddressList(env("GAMBLING_DAPPS", ""));
  assertAllAddresses(gamblingDapps, "GAMBLING_DAPPS");

  const authorizedSenders = parseAddressList(env("DR_AUTHORIZED_SENDERS", ""));
  assertAllAddresses(authorizedSenders, "DR_AUTHORIZED_SENDERS");

  console.log(`Network: ${network.name} (chainId=${chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const Operator = await ethers.getContractFactory("Operator");
  const DepositLimitation = await ethers.getContractFactory("DepositLimitation");
  const GamblingCentralized = await ethers.getContractFactory("GamblingCentralized");

  const operator = await Operator.deploy(linkTokenAddress, deployer.address);
  await operator.waitForDeployment();
  console.log(`Operator: ${operator.target}`);

  if (authorizedSenders.length) {
    await (await operator.setAuthorizedSenders(authorizedSenders)).wait();
  }

  const existingDepositLimitation = (env("DEPOSIT_LIMITATION_ADDRESS") || "").trim();
  let depositLimitationAddress = existingDepositLimitation;
  if (depositLimitationAddress) {
    if (!ethers.isAddress(depositLimitationAddress)) {
      throw new Error(
        `Invalid DEPOSIT_LIMITATION_ADDRESS: ${depositLimitationAddress}`,
      );
    }
  } else {
    const depositLimitation = await DepositLimitation.deploy();
    await depositLimitation.waitForDeployment();
    depositLimitationAddress = depositLimitation.target;
    console.log(`DepositLimitation: ${depositLimitationAddress}`);

    if (gamblingDapps.length) {
      await (await depositLimitation.setGamblingDapps(gamblingDapps)).wait();
    }
    await (
      await depositLimitation.setMonthlySelfLimitation(deployerSelfMonthlyLimitWei)
    ).wait();
  }

  const gambling = await GamblingCentralized.deploy(
    jobIdBytes32,
    drPaymentJuels,
    linkPerWei,
    linkTokenAddress,
    depositLimitationAddress,
    operator.target,
    { value: gamblingInitialEthWei },
  );
  await gambling.waitForDeployment();
  console.log(`GamblingCentralized: ${gambling.target}`);

  const fundGamblingLinkJuels = env("FUND_GAMBLING_LINK_JUELS", "5000000000000000000"); // 5 LINK
  if (fundGamblingLinkJuels !== "0") {
    const link = await ethers.getContractAt(
      "contracts/ocr-lib/LinkTokenInterface.sol:LinkTokenInterface",
      linkTokenAddress,
    );
    await (await link.transfer(gambling.target, fundGamblingLinkJuels)).wait();
  }

  const out = {
    network: network.name,
    chainId,
    deployer: deployer.address,
    linkToken: linkTokenAddress,
    operator: operator.target,
    depositLimitation: depositLimitationAddress,
    gamblingCentralized: gambling.target,
    directRequestExternalJobId: externalJobId,
    directRequestJobIdBytes32: jobIdBytes32,
  };

  const deploymentsPath = path.resolve(
    __dirname,
    "..",
    "deployments",
    `centralized.${network.name}.json`,
  );
  writeJson(deploymentsPath, out);
  console.log(`Saved deployment addresses: ${deploymentsPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
