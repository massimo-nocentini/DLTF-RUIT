#!/bin/bash
set -euo pipefail

# Optional payload override:
#   VALUES="10,20,30" ./create_jobs_sum_4nodes.sh
# Or per-node payloads:
#   VALUES_1="1,2" VALUES_2="1,2,3" VALUES_3="5" VALUES_4="9,9" ./create_jobs_sum_4nodes.sh
#
# The values are embedded into the OCR job TOMLs as a query param:
#   http://10.5.0.6:3000/numbers?values=...

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -n "${VALUES:-}" || -n "${VALUES_1:-}" || -n "${VALUES_2:-}" || -n "${VALUES_3:-}" || -n "${VALUES_4:-}" ]]; then
  "${SCRIPT_DIR}/update_sum_job_payloads.sh"
fi

create_job_and_store_id() {
  local node="$1"
  local toml_path="$2"
  local id_file="$3"

  docker exec -i "$node" bash -lc "
    set -euo pipefail
    cd /home/root
    chmod +x chainlink_login.sh
    ./chainlink_login.sh

    if [[ -f \"$id_file\" ]]; then
      old_id=\$(cat \"$id_file\" || true)
      if [[ -n \"\$old_id\" ]]; then
        chainlink jobs delete \"\$old_id\" || true
      fi
      rm -f \"$id_file\"
    fi

    out=\$(chainlink jobs create \"$toml_path\" 2>&1)
    echo \"\$out\"

    job_id=\$(echo \"\$out\" | grep -Eo '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}' | head -n1 || true)
    if [[ -z \"\$job_id\" ]]; then
      job_id=\$(echo \"\$out\" | grep -Eo '\\b[0-9a-fA-F]{32}\\b' | head -n1 || true)
    fi
    if [[ -z \"\$job_id\" ]]; then
      echo \"ERROR: could not parse job id from output\"
      exit 1
    fi

    mkdir -p \"\$(dirname \"$id_file\")\"
    echo \"\$job_id\" > \"$id_file\"
  "
}

echo "Creating SUM OCR bootstrap job on node1 (replaces previous)"
create_job_and_store_id "chainlink_node1" "/home/root/bootstrap_job.toml" "/chainlink/sum_bootstrap_job_id"
echo "---------------------------------------"

for i in 1 2 3 4; do
  echo "Creating SUM OCR oracle job on node${i} (replaces previous)"
  create_job_and_store_id "chainlink_node${i}" "/home/root/ocr_job.toml" "/chainlink/sum_ocr_job_id"
  echo "---------------------------------------"
done

echo "Done. Trigger a round with:"
echo "  cd ${ROOT_DIR%/docker_containers}/chainlink_truffle && OCR_FEED_ADDRESS=0x99Dca838d573a2Bfdf0919AE5f76beC0f475a84c npm run ocr:request-round:sepolia"
