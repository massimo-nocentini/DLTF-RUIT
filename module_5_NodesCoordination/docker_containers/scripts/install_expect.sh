#!/bin/bash
set -euo pipefail

count="${COUNT:-4}"

for i in $(seq "$count"); do
  node="chainlink_node$i"
  if ! docker ps -a --format '{{.Names}}' | grep -qx "$node"; then
    echo "Skipping $node (container not found)"
    continue
  fi

  echo "Installing expect on $node"
  docker exec -i "$node" bash -lc 'apt-get update && apt-get install -y expect'
  echo "-----------------------------"
done
