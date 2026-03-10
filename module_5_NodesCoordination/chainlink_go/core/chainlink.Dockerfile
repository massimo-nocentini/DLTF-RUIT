# Minimal Docker build for this repository layout (only `core/`, `go.mod`, `go.sum`).
# The upstream Chainlink Dockerfile expects extra directories (e.g. `packr/`, `operator_ui/`, `contracts/`).

FROM golang:1.17-bullseye AS builder
WORKDIR /chainlink

COPY go.mod go.sum ./
RUN go mod download

COPY core ./core

ARG COMMIT_SHA=unknown
ARG ENVIRONMENT=release
RUN go build -o /go/bin/chainlink ./core

FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /go/bin/chainlink /usr/local/bin/chainlink

EXPOSE 6688
ENTRYPOINT ["chainlink"]
CMD ["local", "node"]
