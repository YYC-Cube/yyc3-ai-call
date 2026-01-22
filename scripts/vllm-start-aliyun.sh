#!/usr/bin/env bash
# Spin up a vLLM OpenAI-compatible server on Aliyun GPU
# Usage: MODEL_PATH=/data/models/chatglm3-6b ./scripts/vllm-start-aliyun.sh

set -euo pipefail

: "${MODEL_PATH:?Set MODEL_PATH to your local model dir}"   # e.g., /data/models/chatglm3-6b
MODEL_NAME="${MODEL_NAME:-chatglm3-6b}"                     # served-model-name
IMAGE="${IMAGE:-vllm/vllm-openai:latest}"
PORT="${PORT:-10086}"                                      # host port to expose
CONTAINER_PORT="8000"
TP_SIZE="${TP_SIZE:-1}"                                    # tensor parallel size
MAX_LEN="${MAX_LEN:-8192}"                                 # max model length
CONTAINER_NAME="${CONTAINER_NAME:-vllm-${MODEL_NAME}}"

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container ${CONTAINER_NAME} already running" >&2
  exit 0
fi

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Removing stopped container ${CONTAINER_NAME}" >&2
  docker rm -f "${CONTAINER_NAME}" >/dev/null
fi

docker run --gpus all -d \
  --name "${CONTAINER_NAME}" \
  -p "${PORT}:${CONTAINER_PORT}" \
  -v "${MODEL_PATH}:/model" \
  "${IMAGE}" \
  --model /model \
  --served-model-name "${MODEL_NAME}" \
  --trust-remote-code \
  --port "${CONTAINER_PORT}" \
  --tensor-parallel-size "${TP_SIZE}" \
  --max-model-len "${MAX_LEN}"

echo "Started ${CONTAINER_NAME} at http://<GPU_IP>:${PORT}/v1"
