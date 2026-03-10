const { ethers, network } = require("hardhat");

function env(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

function toUint256FromInt256(value) {
  const n = BigInt(value.toString());
  if (n >= 0n) return n;
  return n + 2n ** 256n;
}

function decodeRidSumFromEncodedInt256(answerInt256) {
  const encoded = toUint256FromInt256(answerInt256);
  const SHIFT = 2n ** 64n;
  return {
    encoded,
    rid: encoded / SHIFT,
    sum: encoded % SHIFT,
  };
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
  const latestRound = Number((await ocr.latestRound()).toString());

  const startRound = Number(env("START_ROUND", "1"));
  const endRound = Number(env("END_ROUND", String(latestRound)));
  const outputJson = env("OUTPUT", "").toLowerCase() === "json";

  const from = Math.max(1, startRound);
  const to = Math.min(latestRound, endRound);

  if (to < from) {
    throw new Error(`Invalid round range: START_ROUND=${from} END_ROUND=${to}`);
  }

  const count = to - from + 1;
  const maxRounds = Number(env("MAX_ROUNDS", "500"));
  const allowLarge = env("ALLOW_LARGE", "false").toLowerCase() === "true";
  if (!allowLarge && count > maxRounds) {
    throw new Error(
      `Refusing to fetch ${count} rounds (>${maxRounds}). Set ALLOW_LARGE=true or narrow START_ROUND/END_ROUND.`,
    );
  }

  const rows = [];
  for (let r = from; r <= to; r++) {
    const data = await ocr.getRoundData(r);
    const answer = data[1];
    const ts = data[2];
    const decoded = decodeRidSumFromEncodedInt256(answer);
    rows.push({
      round: r,
      timestamp: Number(ts.toString()),
      encoded: decoded.encoded.toString(),
      rid: decoded.rid.toString(),
      sum: decoded.sum.toString(),
    });
  }

  if (outputJson) {
    console.log(JSON.stringify({ network: network.name, ocr: ocrAddress, rows }, null, 2));
    return;
  }

  console.log(`Network: ${network.name}`);
  console.log(`OCR: ${ocrAddress}`);
  console.log(`Rounds: ${from}..${to} (latest=${latestRound})`);
  console.log("round\ttimestamp\trid\tsum\tencoded");
  for (const row of rows) {
    console.log(
      `${row.round}\t${row.timestamp}\t${row.rid}\t${row.sum}\t${row.encoded}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

