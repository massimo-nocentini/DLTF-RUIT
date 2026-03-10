const { ethers, network } = require("hardhat");

function env(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

function trimTrailingSlash(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function maybeCreateNewRequest() {
  const values = (env("NUMBER_VALUES") || env("NUMBERS") || "").trim();
  if (!values) return;

  const baseUrl = trimTrailingSlash(env("NUMBER_SERVICE_URL", "http://localhost:3000"));
  const url = `${baseUrl}/newRequest?values=${encodeURIComponent(values)}`;

  if (typeof fetch !== "function") {
    throw new Error(
      "Global fetch() is not available in this Node runtime; set NUMBER_VALUES via curl or upgrade Node.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let resp;
  try {
    resp = await fetch(url, { method: "GET", signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(
      `Failed to set numbers via ${url} (HTTP ${resp.status}). ${body}`.trim(),
    );
  }
  const json = await resp.json().catch(() => null);
  const rid = json && typeof json.rid === "number" ? json.rid : null;
  if (rid === null) {
    console.log(`Created new request via service: ${values}`);
  } else {
    console.log(`Created new request: rid=${rid}, values=${values}`);
  }
}

async function main() {
  const [caller] = await ethers.getSigners();
  if (!caller) throw new Error("No signer available");

  await maybeCreateNewRequest();

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

  const requester = (env("REQUESTER_ADDRESS") || caller.address).trim();
  if (!ethers.isAddress(requester)) {
    throw new Error(`Invalid REQUESTER_ADDRESS: ${requester}`);
  }

  const ocr = await ethers.getContractAt("OffchainAggregator", ocrAddress);
  const tx = await ocr.requestNewRound(requester);
  console.log(`Network: ${network.name}`);
  console.log(`Caller: ${caller.address}`);
  console.log(`OCR: ${ocrAddress}`);
  console.log(`requestNewRound tx: ${tx.hash}`);
  await tx.wait();
  console.log("Round requested.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
