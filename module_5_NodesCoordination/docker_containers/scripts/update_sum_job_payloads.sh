#!/bin/bash
set -euo pipefail

# Updates the SUM OCR job TOMLs to embed a per-request "payload" of numbers.
#
# Usage:
#   VALUES="10,20,30" ./update_sum_job_payloads.sh
# Or per-node:
#   VALUES_1="1,2" VALUES_2="1,2,3" VALUES_3="5" VALUES_4="9,9" ./update_sum_job_payloads.sh
#
# It rewrites the URL inside:
#   DIABOLIK-Master-Thesis/docker_containers/scripts/jobs/job_ocr_sum_oracle_{1..4}.toml
# from:
#   http://10.5.0.6:3000/numbers
# to:
#   http://10.5.0.6:3000/numbers?values=...

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JOBS_DIR="${SCRIPT_DIR}/jobs"

set_url_for_file() {
  local file="$1"
  local values="$2"

  local base='http://10.5.0.6:3000/numbers'
  local url="$base"
  if [[ -n "$values" ]]; then
    url="${base}?values=${values}"
  fi

  # Replace any existing numbers URL (with or without query params) on the 'numbers' line.
  perl -0777 -i -pe "s|(numbers\\s*\\[type=http[^\\]]*url=\")${base}[^\\\"]*(\"[^\\]]*\\])|\\1${url}\\2|g" "$file"
}

for i in 1 2 3 4; do
  file="${JOBS_DIR}/job_ocr_sum_oracle_${i}.toml"
  if [[ ! -f "$file" ]]; then
    echo "Missing file: $file"
    exit 1
  fi

  values_var="VALUES_${i}"
  values="${!values_var:-${VALUES:-}}"
  values="${values//[[:space:]]/}"

  set_url_for_file "$file" "$values"
  if [[ -n "$values" ]]; then
    echo "job_ocr_sum_oracle_${i}.toml -> values=${values}"
  else
    echo "job_ocr_sum_oracle_${i}.toml -> values=(unchanged/default)"
  fi
done

