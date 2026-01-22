#!/usr/bin/env bash
# Simple health check against a vLLM OpenAI endpoint
# Usage: BASE_URL=http://<GPU_IP>:10086 ./scripts/vllm-healthcheck.sh

set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:10086}"
MODEL="${MODEL:-chatglm3-6b}"
TIMEOUT="${TIMEOUT:-5}"

echo "[1/3] /v1/models"
http_code=$(curl -s -o /tmp/models.json -w "%{http_code}" --max-time "${TIMEOUT}" "${BASE_URL}/v1/models")
cat /tmp/models.json | head -n 5 || true
if [ "${http_code}" != "200" ]; then
  echo "models endpoint failed with status ${http_code}" >&2
  exit 1
fi

echo "[2/3] /v1/chat/completions"
read -r -d '' PAYLOAD <<EOF
{"model":"${MODEL}","messages":[{"role":"user","content":"ping"}],"max_tokens":32}
EOF
http_code=$(curl -s -o /tmp/chat.json -w "%{http_code}" --max-time "${TIMEOUT}" \
  -H "Content-Type: application/json" \
  -X POST "${BASE_URL}/v1/chat/completions" \
  -d "${PAYLOAD}")
cat /tmp/chat.json | head -n 5 || true
if [ "${http_code}" != "200" ]; then
  echo "chat completions failed with status ${http_code}" >&2
  exit 1
fi

echo "[3/3] latency (ms)"
start=$(date +%s%3N)
curl -s -o /dev/null --max-time "${TIMEOUT}" "${BASE_URL}/v1/models"
end=$(date +%s%3N)
latency=$((end - start))
echo "OK - latency ${latency} ms"
