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
  const latest = await ocr.latestAnswer();
  const round = await ocr.latestRound();
  const ts = await ocr.latestTimestamp();

  // In "sum feed" mode, observations are encoded as:
  //   encoded = rid * 2^64 + sum
  // so we can recover both from latestAnswer().
  const encoded = BigInt(latest.toString());
  const SHIFT = 2n ** 64n;
  const rid = encoded / SHIFT;
  const sum = encoded % SHIFT;

  console.log(`Network: ${network.name}`);
  console.log(`OCR: ${ocrAddress}`);
  console.log(`latestRound: ${round.toString()}`);
  console.log(`latestTimestamp: ${ts.toString()}`);
  console.log(`latestAnswer (encoded): ${encoded.toString()}`);
  console.log(`rid: ${rid.toString()}`);
  console.log(`sum: ${sum.toString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
