# Base Chainlink image (pin to a specific version).
ARG BASE_IMAGE=smartcontract/chainlink:1.0.1
FROM ${BASE_IMAGE}

RUN mkdir -p /chainlink

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
