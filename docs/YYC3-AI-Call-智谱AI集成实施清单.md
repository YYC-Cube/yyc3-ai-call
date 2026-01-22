# YYC³-AI-Call 智谱AI集成实施清单

**文档版本**：1.0.0  
**更新日期**：2026-01-22  
**目标**：基于智谱AI永久商业授权，实现本地化AI能力部署

---

## 🎯 总体目标

- ✅ 部署ChatGLM3-6B智能对话引擎
- ✅ 集成CodeGeeX4代码生成能力
- ✅ 集成CogAgent视觉理解能力
- ✅ 实现<200ms推理延迟
- ✅ 100%本地化，数据不出域
- ✅ 年节约AI成本¥180-360K

---

## 📅 6周实施计划

### 第1周：准备与基础部署

#### 1.1 硬件采购与到位

**GPU服务器配置（推荐）**

| 项目       | 规格                 | 数量 | 用途               | 预算     |
| ---------- | -------------------- | ---- | ------------------ | -------- |
| GPU服务器  | 2x NVIDIA L40 (48GB) | 2台  | ChatGLM + CogAgent | ¥80K     |
| 存储       | NVMe SSD 2TB         | 2套  | 模型存储           | ¥6K      |
| 网络交换机 | 10Gbps               | 1台  | 内网通信           | ¥4K      |
| **总计**   | -                    | -    | -                  | **¥90K** |

**采购检查清单**：

- [ ] 联系GPU供应商（推荐：阿里云、腾讯云GPU实例，或浪潮、曙光服务器）
- [ ] 确认交付时间（通常2-4周）
- [ ] 验收GPU性能（运行基准测试）
- [ ] 配置网络和存储

#### 1.2 软件环境准备

```bash
# 检查清单
- [ ] 安装Ubuntu 22.04 LTS
- [ ] 安装CUDA 12.1+
- [ ] 安装cuDNN 8.9+
- [ ] 安装Docker + NVIDIA Container Toolkit
- [ ] 配置GPU驱动

# 验证命令
nvidia-smi  # 检查GPU可见性
docker run --gpus all nvidia/cuda:12.1-base nvidia-smi  # 验证Docker GPU支持
```

#### 1.3 模型下载

```bash
# 创建模型目录
mkdir -p /data/models
cd /data/models

# 下载ChatGLM3-6B（约12GB）
git lfs install
git clone https://huggingface.co/THUDM/chatglm3-6b

# 下载CodeGeeX4-ALL-9B（约18GB）
git clone https://huggingface.co/THUDM/codegeex4-all-9b

# 下载CogAgent（约24GB）
git clone https://huggingface.co/THUDM/cogagent-chat-hf

# 下载CogVideoX-5B（可选，约10GB）
git clone https://huggingface.co/THUDM/CogVideoX-5b

# 验证模型完整性
ls -lh chatglm3-6b/
ls -lh codegeex4-all-9b/
```

#### 1.4 推理框架部署

```bash
# 安装vLLM（高性能推理框架）
pip install vllm==0.3.0

# 或使用Docker
docker pull vllm/vllm-openai:latest
```

**第1周交付物**：

- ✅ GPU服务器到位并配置完成
- ✅ 所有模型下载完成
- ✅ vLLM推理框架安装成功

---

### 第2周：ChatGLM3-6B对话引擎上线

#### 2.1 推理服务部署

**方式A：直接启动（开发测试）**

```bash
# 启动ChatGLM3-6B服务
python -m vllm.entrypoints.openai.api_server \
  --model /data/models/chatglm3-6b \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 2 \
  --max-model-len 8192 \
  --trust-remote-code

# 测试API
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "chatglm3-6b",
    "messages": [{"role": "user", "content": "你好"}],
    "max_tokens": 100
  }'
```

**方式B：Docker Compose（生产推荐）**

```yaml
# docker-compose.ai.yml
version: "3.8"

services:
  chatglm3-service:
    image: vllm/vllm-openai:latest
    runtime: nvidia
    environment:
      - CUDA_VISIBLE_DEVICES=0,1
      - VLLM_WORKER_MULTIPROC_METHOD=spawn
    volumes:
      - /data/models:/models
    ports:
      - "8000:8000"
    command:
      - --model
      - /models/chatglm3-6b
      - --host
      - 0.0.0.0
      - --port
      - "8000"
      - --tensor-parallel-size
      - "2"
      - --max-model-len
      - "8192"
      - --trust-remote-code
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 2
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # Redis缓存（用于AI响应缓存）
  ai-cache:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    command: redis-server --maxmemory 4gb --maxmemory-policy allkeys-lru
    volumes:
      - ai-cache-data:/data
    restart: unless-stopped

volumes:
  ai-cache-data:
```

启动服务：

```bash
docker-compose -f docker-compose.ai.yml up -d
docker-compose -f docker-compose.ai.yml logs -f chatglm3-service
```

#### 2.2 性能基准测试

```python
# scripts/benchmark_chatglm.py
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
import requests

API_URL = "http://localhost:8000/v1/chat/completions"

def single_request(prompt: str):
    start = time.time()
    response = requests.post(
        API_URL,
        json={
            "model": "chatglm3-6b",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100,
        }
    )
    latency = time.time() - start
    return latency, response.status_code

def benchmark(num_requests: int = 100, concurrency: int = 10):
    prompts = [f"这是测试消息{i}，请简短回复。" for i in range(num_requests)]

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        start_time = time.time()
        results = list(executor.map(lambda p: single_request(p), prompts))
        total_time = time.time() - start_time

    latencies = [r[0] for r in results]
    success_count = sum(1 for r in results if r[1] == 200)

    print(f"总请求数: {num_requests}")
    print(f"并发数: {concurrency}")
    print(f"总耗时: {total_time:.2f}秒")
    print(f"成功率: {success_count/num_requests*100:.1f}%")
    print(f"吞吐量: {num_requests/total_time:.1f} req/s")
    print(f"平均延迟: {sum(latencies)/len(latencies)*1000:.0f}ms")
    print(f"P50延迟: {sorted(latencies)[len(latencies)//2]*1000:.0f}ms")
    print(f"P95延迟: {sorted(latencies)[int(len(latencies)*0.95)]*1000:.0f}ms")
    print(f"P99延迟: {sorted(latencies)[int(len(latencies)*0.99)]*1000:.0f}ms")

if __name__ == "__main__":
    print("开始性能测试...")
    benchmark(num_requests=100, concurrency=10)
```

**性能目标**：

- ✅ P50延迟 < 100ms
- ✅ P95延迟 < 200ms
- ✅ 吞吐量 > 50 req/s
- ✅ 成功率 > 99%

#### 2.3 应用集成

创建ChatGLM集成库（复制第4章代码）：

```bash
# 检查清单
- [ ] 创建 lib/chatglm.ts
- [ ] 实现 chatCompletion() 函数
- [ ] 实现 recognizeIntent() 意图识别
- [ ] 实现 analyzeSentiment() 情感分析
- [ ] 添加单元测试（覆盖率>80%）
```

**第2周交付物**：

- ✅ ChatGLM3服务稳定运行
- ✅ 性能基准达标
- ✅ 集成代码完成并测试通过

---

### 第3周：意图识别与智能对话

#### 3.1 意图识别系统

```typescript
// lib/intent-system.ts - 完整意图识别系统
import { chatCompletion } from "./chatglm";

interface IntentConfig {
  intents: Array<{
    name: string;
    description: string;
    examples: string[];
    entities: string[];
  }>;
}

const intentConfig: IntentConfig = {
  intents: [
    {
      name: "咨询",
      description: "用户询问产品、服务、价格等信息",
      examples: [
        "你们的课程多少钱？",
        "有没有优惠活动？",
        "上课时间是什么时候？",
      ],
      entities: ["课程名称", "价格", "时间", "地点"],
    },
    {
      name: "投诉",
      description: "用户表达不满或问题",
      examples: ["老师讲得太快了", "教学质量不行", "我要退款"],
      entities: ["问题类型", "严重程度", "诉求"],
    },
    {
      name: "预约",
      description: "用户希望预约服务或安排时间",
      examples: ["我想约一个试听课", "明天下午3点可以吗？", "帮我安排一个咨询"],
      entities: ["服务类型", "时间", "联系方式"],
    },
    {
      name: "反馈",
      description: "用户提供意见或建议",
      examples: ["课程内容很好", "希望增加更多案例", "老师很负责"],
      entities: ["反馈类型", "评价", "建议"],
    },
    {
      name: "退订",
      description: "用户希望取消服务",
      examples: ["我不想上了", "帮我退课", "取消预约"],
      entities: ["退订原因", "退订类型"],
    },
  ],
};

export async function recognizeIntentEnhanced(userInput: string): Promise<{
  intent: string;
  confidence: number;
  entities: Record<string, string>;
  reasoning: string;
}> {
  const systemPrompt = `你是一个专业的意图识别助手。分析用户输入，识别意图并提取实体。

支持的意图类型：
${intentConfig.intents.map((i) => `- ${i.name}：${i.description}`).join("\n")}

返回JSON格式（必须严格遵循此格式）：
{
  "intent": "意图名称",
  "confidence": 0.0-1.0,
  "entities": {"实体名": "实体值"},
  "reasoning": "判断理由"
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `分析：${userInput}` },
  ];

  const response = await chatCompletion(messages, { temperature: 0.2 });

  try {
    const result = JSON.parse(response);
    return result;
  } catch (error) {
    console.error("Intent parsing error:", error);
    return {
      intent: "其他",
      confidence: 0.5,
      entities: {},
      reasoning: "解析失败",
    };
  }
}
```

#### 3.2 外呼对话系统完整实现

参考第4章的完整代码实现外呼对话API。

**检查清单**：

- [ ] 实现意图识别
- [ ] 实现情感分析
- [ ] 实现对话历史管理
- [ ] 实现转人工逻辑
- [ ] 添加对话日志记录
- [ ] 集成到现有外呼系统

#### 3.3 测试与优化

```bash
# 创建测试数据集
cat > tests/intent_test_cases.json << 'EOF'
[
  {"input": "你们的课程多少钱？", "expected_intent": "咨询"},
  {"input": "老师讲得太快了", "expected_intent": "投诉"},
  {"input": "我想约一个试听课", "expected_intent": "预约"},
  {"input": "课程内容很好", "expected_intent": "反馈"},
  {"input": "我不想上了", "expected_intent": "退订"}
]
EOF

# 运行测试
pnpm test:intent
```

**第3周交付物**：

- ✅ 意图识别准确率>85%
- ✅ 外呼对话系统功能完整
- ✅ 所有测试用例通过

---

### 第4周：CodeGeeX4代码生成集成

#### 4.1 CodeGeeX4服务部署

```bash
# 启动CodeGeeX4服务
python -m vllm.entrypoints.openai.api_server \
  --model /data/models/codegeex4-all-9b \
  --host 0.0.0.0 \
  --port 8001 \
  --tensor-parallel-size 1 \
  --max-model-len 4096 \
  --trust-remote-code
```

**Docker Compose添加**：

```yaml
# 在docker-compose.ai.yml中添加
codegeex4-service:
  image: vllm/vllm-openai:latest
  runtime: nvidia
  environment:
    - CUDA_VISIBLE_DEVICES=2
  volumes:
    - /data/models:/models
  ports:
    - "8001:8001"
  command:
    - --model
    - /models/codegeex4-all-9b
    - --host
    - 0.0.0.0
    - --port
    - "8001"
    - --max-model-len
    - "4096"
    - --trust-remote-code
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
  restart: unless-stopped
```

#### 4.2 工单自动化实现

参考第4章代码，实现：

- [ ] 数据提取脚本生成
- [ ] 报表生成脚本
- [ ] API测试代码生成
- [ ] 工单自动化处理流程

**实际应用场景**：

1. **数据导出需求** - 自动生成SQL查询和Python导出脚本
2. **API测试** - 自动生成Jest/Playwright测试用例
3. **报表生成** - 自动生成数据分析和可视化代码
4. **系统检查** - 自动生成监控和健康检查脚本

**第4周交付物**：

- ✅ CodeGeeX4服务上线
- ✅ 工单自动化系统功能完整
- ✅ 至少3个实际场景应用落地

---

### 第5周：CogAgent视觉能力集成

#### 5.1 CogAgent服务部署

```python
# scripts/start_cogagent.py
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_path = "/data/models/cogagent-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True
)

# 启动FastAPI服务
from fastapi import FastAPI, File, UploadFile
from PIL import Image
import io

app = FastAPI()

@app.post("/analyze")
async def analyze_image(file: UploadFile, task: str = "describe"):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    if task == "describe":
        prompt = "描述这张图片的内容"
    elif task == "ocr":
        prompt = "提取图片中的所有文字"
    elif task == "safety_check":
        prompt = "检查图片是否包含不适当内容"
    else:
        prompt = task

    inputs = tokenizer.encode_plus(prompt, image, return_tensors="pt")
    outputs = model.generate(**inputs, max_length=512)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return {"result": result, "task": task}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
```

#### 5.2 应用场景实现

**场景1：身份验证**

```typescript
// 自动识别身份证信息
const idInfo = await verifyCustomerIdentity(idCardImageUrl);
console.log(idInfo);
// { isValid: true, name: "张三", idNumber: "1101..." }
```

**场景2：营销素材审核**

```typescript
// 检查营销图片合规性
const moderation = await moderateMarketingImage(imageUrl);
console.log(moderation);
// { approved: false, issues: ["包含敏感词"], suggestions: [...] }
```

**场景3：客户上传文件解析**

- 发票识别
- 合同内容提取
- 表单自动填充

**第5周交付物**：

- ✅ CogAgent服务上线
- ✅ 至少2个视觉应用场景落地
- ✅ 图像处理流程优化（缓存、批处理）

---

### 第6周：性能优化与上线准备

#### 6.1 性能优化

**缓存策略**：

```typescript
// lib/ai-cache-strategy.ts
import { redis } from "./redis";

interface CacheStrategy {
  ttl: number; // 缓存时间（秒）
  condition: (input: string) => boolean; // 缓存条件
}

const strategies: Record<string, CacheStrategy> = {
  // 常见问题FAQ - 长期缓存
  faq: {
    ttl: 86400, // 24小时
    condition: (input) => input.length < 50 && !input.includes("我"),
  },
  // 个性化对话 - 短期缓存
  personalized: {
    ttl: 300, // 5分钟
    condition: (input) => input.includes("我") || input.includes("我的"),
  },
  // 代码生成 - 中期缓存
  code_gen: {
    ttl: 3600, // 1小时
    condition: (input) => input.includes("生成") || input.includes("脚本"),
  },
};

export async function getCachedOrGenerate(
  key: string,
  generator: () => Promise<string>,
  strategyName: string = "faq",
): Promise<string> {
  const strategy = strategies[strategyName];
  if (!strategy) {
    return await generator();
  }

  const cached = await redis.get(key);
  if (cached) {
    return cached;
  }

  const result = await generator();
  await redis.setex(key, strategy.ttl, result);

  return result;
}
```

**批量推理**：

```typescript
// 收集多个请求，批量处理
const batchQueue = new Map<string, BatchRequest>();

setInterval(async () => {
  if (batchQueue.size > 0) {
    const requests = Array.from(batchQueue.values());
    const results = await batchChatCompletion(requests);

    // 分发结果
    for (const [id, result] of results.entries()) {
      // 通知等待的请求
    }

    batchQueue.clear();
  }
}, 100); // 每100ms处理一次批量
```

#### 6.2 监控告警

```yaml
# prometheus-ai-rules.yml
groups:
  - name: ai_service
    rules:
      # AI服务可用性
      - alert: AIServiceDown
        expr: up{job="ai-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "AI服务不可用"
          description: "{{ $labels.instance }} 已停止响应"

      # 高延迟告警
      - alert: AIHighLatency
        expr: histogram_quantile(0.95, ai_inference_latency_ms) > 500
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "AI推理延迟过高"
          description: "P95延迟超过500ms"

      # GPU利用率
      - alert: GPUHighUtilization
        expr: nvidia_gpu_utilization > 90
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "GPU使用率过高"
          description: "GPU {{ $labels.gpu }} 使用率持续>90%"
```

#### 6.3 压力测试

```bash
# 使用Locust进行压力测试
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class AIUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def chat_completion(self):
        self.client.post("/api/outbound-call", json={
            "callId": "test-123",
            "userMessage": "你好，我想了解课程信息"
        })

    @task(2)
    def intent_recognition(self):
        self.client.post("/api/intent", json={
            "text": "请问有什么优惠活动吗？"
        })
EOF

# 运行压力测试：1000用户，50 req/s
locust -f locustfile.py --host=http://localhost:3000 \
  --users 1000 --spawn-rate 50 --run-time 10m
```

**性能目标验证**：

- ✅ 峰值QPS > 200
- ✅ P95延迟 < 200ms
- ✅ 错误率 < 0.1%
- ✅ GPU利用率 70-80%
- ✅ 可用性 > 99.9%

#### 6.4 上线准备清单

**技术准备**：

- [ ] 所有服务健康检查通过
- [ ] 性能测试达标
- [ ] 监控告警配置完成
- [ ] 备份和恢复流程测试
- [ ] 文档完整（API文档、运维手册）

**业务准备**：

- [ ] 灰度发布计划（10% -> 50% -> 100%）
- [ ] 回滚方案验证
- [ ] 客服团队培训
- [ ] 应急预案准备

**第6周交付物**：

- ✅ 性能优化完成，达到目标指标
- ✅ 监控告警系统完整
- ✅ 通过压力测试验证
- ✅ 正式上线部署

---

## 📊 关键指标追踪

### 技术指标

| 指标           | 目标   | 当前 | 达成率 |
| -------------- | ------ | ---- | ------ |
| ChatGLM延迟    | <200ms | -    | -      |
| 意图识别准确率 | >85%   | -    | -      |
| 系统可用性     | >99.9% | -    | -      |
| GPU利用率      | 70-80% | -    | -      |
| 缓存命中率     | >60%   | -    | -      |

### 业务指标

| 指标         | 目标    | 当前 | 达成率 |
| ------------ | ------- | ---- | ------ |
| 自动化率     | +40%    | -    | -      |
| 用户满意度   | +30%    | -    | -      |
| 平均处理时间 | -50%    | -    | -      |
| AI成本节约   | ¥30K/月 | -    | -      |

---

## 🛡️ 风险应对

### 高风险项

1. **GPU采购延迟** 🔴

   - 应对：提前2周联系供应商，备选云GPU方案
   - 负责人：运维负责人
   - 检查：每周

2. **模型性能不达预期** 🟡

   - 应对：使用vLLM优化、考虑模型量化
   - 负责人：AI工程师
   - 检查：第2周性能测试后

3. **团队AI技能不足** 🟡
   - 应对：智谱官方培训 + 外部专家指导
   - 负责人：技术经理
   - 检查：持续

---

## 📞 支持与资源

### 智谱AI官方支持

- **技术文档**：https://open.bigmodel.cn/dev/
- **开发者社区**：https://github.com/THUDM
- **技术支持**：support@zhipuai.cn
- **商业授权咨询**：commercial@zhipuai.cn

### 推荐学习资源

1. **vLLM官方文档**：https://docs.vllm.ai/
2. **CUDA优化指南**：https://docs.nvidia.com/cuda/
3. **大模型推理优化**：《LLM Inference Optimization》
4. **GPU性能调优**：NVIDIA官方课程

### 外部专家

- **AI架构师**：可联系智谱AI获取技术顾问支持
- **GPU优化专家**：NVIDIA开发者计划
- **MLOps专家**：可考虑咨询服务

---

## ✅ 每日站会检查项

**每日15分钟站会**：

1. **昨日进展**：完成了什么？
2. **今日计划**：要做什么？
3. **遇到障碍**：需要什么帮助？
4. **风险提示**：有什么潜在问题？

**每周Review**：

- 技术指标回顾
- 业务指标回顾
- 下周计划调整
- 风险更新

---

## 🎉 成功标准

**6周后达成目标**：

✅ **技术成功**

- ChatGLM3/CodeGeeX4/CogAgent三个模型全部上线
- 推理延迟<200ms，可用性>99.9%
- 完整的监控告警体系
- 完善的文档和知识库

✅ **业务成功**

- 意图识别精度提升40%
- 自动化率提升40%
- 零AI API成本
- 用户满意度提升30%

✅ **团队成功**

- 团队掌握AI工程能力
- 建立AI开发最佳实践
- 形成技术影响力

---

**文档版本**：1.0.0  
**最后更新**：2026-01-22  
**维护者**：AI技术团队

**祝实施顺利！有任何问题请及时沟通。** 🚀
