#!/bin/bash
set -euo pipefail

CHAINLINK_ROOT="${ROOT:-/chainlink}"
mkdir -p "${CHAINLINK_ROOT}"

# Create the node password file if missing.
if [ ! -f "${CHAINLINK_ROOT}/.password" ]; then
  NODE_PASSWORD="${CL_NODE_PASSWORD:-${PRIVATE_KEY_PASSWORD:-}}"
  if [ -z "${NODE_PASSWORD}" ]; then
    echo "ERROR: missing CL_NODE_PASSWORD (or PRIVATE_KEY_PASSWORD) for ${CHAINLINK_ROOT}/.password" >&2
    exit 1
  fi
  (umask 077 && printf '%s' "${NODE_PASSWORD}" > "${CHAINLINK_ROOT}/.password")
fi

# Create the API credentials file if missing (email on first line, password on second).
if [ ! -f "${CHAINLINK_ROOT}/.api" ]; then
  if [ -z "${CL_API_EMAIL:-}" ] || [ -z "${CL_API_PASSWORD:-}" ]; then
    echo "ERROR: missing CL_API_EMAIL and/or CL_API_PASSWORD for ${CHAINLINK_ROOT}/.api" >&2
    exit 1
  fi
  (umask 077 && printf '%s\n%s\n' "${CL_API_EMAIL}" "${CL_API_PASSWORD}" > "${CHAINLINK_ROOT}/.api")
fi

# Default command if none provided.
if [ "$#" -eq 0 ]; then
  set -- chainlink node start -p "${CHAINLINK_ROOT}/.password" -a "${CHAINLINK_ROOT}/.api"
fi

exec "$@"
