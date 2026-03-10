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

async function main() {
  const addrs = parseAddressList(env("OCR_TRANSMITTERS", ""));
  if (addrs.length === 0) {
    throw new Error(
      "Missing OCR_TRANSMITTERS (comma-separated list of transmitter addresses).",
    );
  }

  const provider = ethers.provider;
  console.log(`Network: ${network.name}`);

  for (const addr of addrs) {
    if (!ethers.isAddress(addr)) {
      console.log(`${addr}: INVALID ADDRESS`);
      continue;
    }
    const bal = await provider.getBalance(addr);
    console.log(`${addr}: ${ethers.formatEther(bal)} ETH`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

