const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

require("@nomicfoundation/hardhat-ethers");

// Always load the repo-local .env, even when Hardhat is invoked from a subdir (e.g. `chainlink_truffle/scripts`).
dotenv.config({ path: path.resolve(__dirname, ".env"), override: false });

// Convenience: reuse the same Sepolia RPC env vars used by the thesis docker setup, if present.
const chainlinkEnvPath = path.resolve(__dirname, "..", "docker_containers", "chainlink.env");
if (fs.existsSync(chainlinkEnvPath)) {
  dotenv.config({ path: chainlinkEnvPath, override: false });
}

function getNetworkUrl() {
  return (
    process.env.SEPOLIA_RPC_URL ||
    process.env.ETH_HTTP_URL ||
    process.env.RPC_URL ||
    ""
  ).trim();
}

function getNetworkAccounts() {
  const privateKey =
    process.env.DEPLOYER_PRIVATE_KEY ||
    process.env.SEPOLIA_PRIVATE_KEY ||
    process.env.PRIVATE_KEY ||
    "";

  if (privateKey.trim()) {
    const normalized = privateKey.trim().startsWith("0x")
      ? privateKey.trim()
      : `0x${privateKey.trim()}`;
    return [normalized];
  }

  const mnemonic = process.env.MNEMONIC || "";
  if (mnemonic.trim()) return { mnemonic: mnemonic.trim() };

  return [];
}

const sepoliaUrl = getNetworkUrl();
const sepoliaAccounts = getNetworkAccounts();

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.2",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
  networks: {
    hardhat: { chainId: 1337 },
    sepolia: {
      url: sepoliaUrl,
      chainId: 11155111,
      accounts: sepoliaAccounts,
    },
  },
};
