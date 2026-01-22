# AI SDK 集成快速指南

## 📦 已添加的文件

### 后端 SDK & API 路由

- `lib/ai-client.ts` - AI 客户端 SDK（OpenAI 兼容 API 包装）
- `app/api/ai/chat/route.ts` - 对话接口
- `app/api/ai/intent/route.ts` - 意图分类接口
- `app/api/ai/sentiment/route.ts` - 情感分析接口
- `app/api/ai/health/route.ts` - 健康检查接口

### 前端 Hooks & 组件

- `lib/hooks/useAI.ts` - React hook 包装所有 AI 操作
- `components/ai-chat.tsx` - 完整聊天组件示例

### 配置

- `.env.local.example` - 环境变量模板

---

## 🚀 快速开始

### 1. 环境配置

```bash
# 复制模板
cp .env.local.example .env.local

# 编辑 .env.local，替换占位符
AI_BASE_URL=http://<YOUR_GPU_IP>:10086/v1
AI_MODEL=chatglm3-6b
AI_TIMEOUT_MS=20000
```

### 2. 后端调用（Node.js / Next.js Server）

```typescript
// 方式1：使用 singleton 客户端
import { getAIClient } from "@/lib/ai-client";

const client = getAIClient();
const response = await client.chat([{ role: "user", content: "你好" }]);
console.log(response.choices[0].message.content);

// 方式2：创建自定义实例
import { createAIClient } from "@/lib/ai-client";

const customClient = createAIClient(
  "http://gpu-ip:10086/v1",
  "chatglm3-6b",
  20000,
  0.6,
  1024,
);
const result = await customClient.classifyIntent("我要退货");
console.log(result.intent, result.confidence);
```

### 3. 前端调用（React 组件）

```typescript
'use client';

import { useAI } from '@/lib/hooks/useAI';

export function MyComponent() {
  const { chat, classifyIntent, analyzeSentiment, loading, error } = useAI();

  const handleChat = async () => {
    try {
      const response = await chat([
        { role: 'user', content: '你好，我想咨询产品' }
      ]);
      console.log(response.choices[0].message.content);
    } catch (err) {
      console.error('Chat failed:', err);
    }
  };

  const handleIntent = async () => {
    const { intent, confidence } = await classifyIntent(
      '我要返回这个订单'
    );
    console.log(`Intent: ${intent} (${confidence})`);
  };

  return (
    <div>
      <button onClick={handleChat} disabled={loading}>
        Chat
      </button>
      <button onClick={handleIntent} disabled={loading}>
        Classify
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### 4. 使用 Next.js API 路由

```typescript
// POST /api/ai/chat
fetch("/api/ai/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "你好" }],
    temperature: 0.6,
    max_tokens: 512,
  }),
})
  .then((r) => r.json())
  .then((data) => console.log(data.choices[0].message.content));

// POST /api/ai/intent
fetch("/api/ai/intent", {
  method: "POST",
  body: JSON.stringify({
    message: "我要投诉",
    intents: ["sales", "support", "billing", "feedback"],
  }),
})
  .then((r) => r.json())
  .then((data) => console.log(data)); // { intent, confidence }

// POST /api/ai/sentiment
fetch("/api/ai/sentiment", {
  method: "POST",
  body: JSON.stringify({ text: "太棒了！" }),
})
  .then((r) => r.json())
  .then((data) => console.log(data)); // { sentiment, score }

// GET /api/ai/health
fetch("/api/ai/health")
  .then((r) => r.json())
  .then((data) => console.log(data)); // { healthy, models, latency_ms }
```

---

## 🔧 API 参考

### AIClient

```typescript
class AIClient {
  // 基础对话
  async chat(
    messages: ChatMessage[],
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
    }
  ): Promise<ChatCompletionResponse>

  // 流式对话（返回 ReadableStream）
  async chatStream(...): Promise<ReadableStream<Uint8Array>>

  // 意图分类
  async classifyIntent(
    userMessage: string,
    intents?: string[]
  ): Promise<{ intent: string; confidence: number }>

  // 情感分析
  async analyzeSentiment(
    text: string
  ): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number }>

  // 获取可用模型
  async getModels(): Promise<string[]>

  // 健康检查
  async healthCheck(): Promise<boolean>

  // 提取响应文本
  extractText(response: ChatCompletionResponse): string
}
```

### useAI Hook

```typescript
function useAI(options?: UseAIOptions) {
  return {
    loading: boolean;
    error: Error | null;
    chat: (messages, options?) => Promise<ChatCompletionResponse>;
    classifyIntent: (message, intents?) => Promise<{ intent, confidence }>;
    analyzeSentiment: (text) => Promise<{ sentiment, score }>;
    healthCheck: () => Promise<health>;
    cancel: () => void;
  }
}
```

---

## 🧪 测试示例

### 使用 curl 测试

```bash
# 对话
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"你好"}],
    "max_tokens": 256
  }'

# 意图分类
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "我要退货",
    "intents": ["sales","support","billing","feedback","other"]
  }'

# 情感分析
curl -X POST http://localhost:3000/api/ai/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"太好了，产品非常满意！"}'

# 健康检查
curl http://localhost:3000/api/ai/health
```

---

## 📊 使用聊天组件

```typescript
// 在 page.tsx 中使用
import { AIChatComponent } from '@/components/ai-chat';

export default function Page() {
  return <AIChatComponent />;
}
```

该组件包括：

- ✅ 实时聊天界面
- ✅ 自动意图分类与情感分析
- ✅ AI 服务健康状态显示
- ✅ 自动滚动到最新消息
- ✅ 错误提示

---

## ⚙️ 环境变量详解

| 变量                  | 说明               | 默认值                      |
| --------------------- | ------------------ | --------------------------- |
| `AI_BASE_URL`         | vLLM 服务地址      | `http://127.0.0.1:10086/v1` |
| `AI_MODEL`            | 默认模型名         | `chatglm3-6b`               |
| `AI_TIMEOUT_MS`       | 请求超时（毫秒）   | `20000`                     |
| `AI_TEMPERATURE`      | 温度（创意度）     | `0.6`                       |
| `AI_MAX_TOKENS`       | 最大生成令牌       | `1024`                      |
| `CODE_MODEL_BASE_URL` | CodeGeeX4 服务地址 | -                           |
| `VLM_BASE_URL`        | CogAgent 服务地址  | -                           |

---

## 🛠️ 多模型支持示例

```typescript
// ChatGLM3 用于对话
const chatClient = createAIClient(process.env.AI_BASE_URL, "chatglm3-6b");

// CodeGeeX4 用于代码生成
const codeClient = createAIClient(
  process.env.CODE_MODEL_BASE_URL,
  "codegeex4-all-9b",
);

// CogAgent 用于视觉理解（如需要）
const visionClient = createAIClient(process.env.VLM_BASE_URL, "cogagent");
```

---

## 🚀 下一步

1. **配置环境变量** → `.env.local`
2. **启动 vLLM 服务** → `./scripts/vllm-start-aliyun.sh` 或 docker-compose
3. **测试健康检查** → `./scripts/vllm-healthcheck.sh` 或 `curl /api/ai/health`
4. **集成到业务流程** → 对话、分类、分析等
5. **性能优化** → 调整 `max_tokens`、`temperature`、缓存策略
6. **监控上线** → 使用 Prometheus 监控 vLLM 指标

更详细的实施计划见 [docs/YYC3-AI-Call-智谱AI集成实施清单.md](../docs/YYC3-AI-Call-智谱AI集成实施清单.md)
