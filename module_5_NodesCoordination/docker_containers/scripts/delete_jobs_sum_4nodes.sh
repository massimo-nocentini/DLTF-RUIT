#!/bin/bash
set -euo pipefail

delete_if_present() {
  local node="$1"
  local id_file="$2"

  docker exec -i "$node" bash -lc "
    set -euo pipefail
    cd /home/root
    chmod +x chainlink_login.sh
    ./chainlink_login.sh

    if [[ -f \"$id_file\" ]]; then
      id=\$(cat \"$id_file\" || true)
      if [[ -n \"\$id\" ]]; then
        chainlink jobs delete \"\$id\" || true
      fi
      rm -f \"$id_file\"
      echo \"Deleted job \$id on $node\"
    else
      echo \"No stored job id at $id_file on $node\"
    fi
  "
}

echo "Deleting SUM OCR jobs (based on stored ids in /chainlink)"
delete_if_present "chainlink_node1" "/chainlink/sum_bootstrap_job_id"
for i in 1 2 3 4; do
  delete_if_present "chainlink_node${i}" "/chainlink/sum_ocr_job_id"
done

echo "Done."

