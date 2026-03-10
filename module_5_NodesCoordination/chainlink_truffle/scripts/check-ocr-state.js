const { ethers, network } = require("hardhat");

function env(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

async function main() {
  const ocrAddress = (
    env("OCR_FEED_ADDRESS") ||
    env("OCR_ADDRESS") ||
    env("OFFCHAIN_AGGREGATOR_ADDRESS") ||
    ""
  ).trim();
  if (!ethers.isAddress(ocrAddress)) {
    throw new Error(
      `Missing/invalid OCR address. Set OCR_FEED_ADDRESS (or OCR_ADDRESS). Got: ${ocrAddress}`,
    );
  }

  const ocr = await ethers.getContractAt("OffchainAggregator", ocrAddress);

  const [caller] = await ethers.getSigners();
  const callerAddr = caller ? caller.address : "(no signer)";

  const owner = await ocr.owner();
  const trackerEnabled = await ocr.trackerEnabled();

  const configDetails = await ocr.latestConfigDetails();
  const configCount = configDetails[0];
  const configBlockNumber = configDetails[1];
  const configDigest = configDetails[2];

  const latestRound = await ocr.latestRound();
  const latestAnswer = await ocr.latestAnswer();

  console.log(`Network: ${network.name}`);
  console.log(`Caller: ${callerAddr}`);
  console.log(`OCR: ${ocrAddress}`);
  console.log(`owner: ${owner}`);
  console.log(`trackerEnabled: ${trackerEnabled}`);
  console.log(`configCount: ${configCount.toString()}`);
  console.log(`configBlockNumber: ${configBlockNumber.toString()}`);
  console.log(`configDigest: ${configDigest}`);
  console.log(`latestRound: ${latestRound.toString()}`);
  console.log(`latestAnswer: ${latestAnswer.toString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

