#!/bin/bash

# YYC³ AI Intelligent Calling - 数据库初始化脚本
# 用法: bash scripts/init-db.sh

set -e  # 遇到错误停止执行

echo "🚀 YYC³ 数据库初始化脚本"
echo "======================================"

# 检查必要环境变量
if [ -z "$DATABASE_URL" ]; then
  echo "❌ 错误: DATABASE_URL 环境变量未设置"
  echo "   请在 .env.local 中配置 DATABASE_URL"
  exit 1
fi

# 等待PostgreSQL就绪
echo "⏳ 等待PostgreSQL服务就绪..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ PostgreSQL已就绪"
    break
  fi
  attempt=$((attempt + 1))
  echo "  (尝试 $attempt/$max_attempts)"
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ PostgreSQL启动超时"
  exit 1
fi

echo ""
echo "📊 创建数据库表..."
echo "======================================"

# 创建customers表
psql "$DATABASE_URL" << 'EOF'
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'new',
  tags TEXT[],
  follow_up_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

COMMENT ON TABLE customers IS '客户信息表';
COMMENT ON COLUMN customers.name IS '客户姓名';
COMMENT ON COLUMN customers.email IS '客户邮箱';
COMMENT ON COLUMN customers.phone IS '客户电话';
COMMENT ON COLUMN customers.status IS '客户状态';
COMMENT ON COLUMN customers.tags IS '客户标签';

EOF

echo "✅ customers表创建成功"

# 创建campaigns表
psql "$DATABASE_URL" << 'EOF'
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  content TEXT,
  target_audience JSONB,
  schedule JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

COMMENT ON TABLE campaigns IS '营销活动表';
COMMENT ON COLUMN campaigns.type IS '活动类型: email/sms/push';

EOF

echo "✅ campaigns表创建成功"

# 创建forms表
psql "$DATABASE_URL" << 'EOF'
CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  fields JSONB NOT NULL,
  settings JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at);

COMMENT ON TABLE forms IS '表单管理表';

EOF

echo "✅ forms表创建成功"

# 创建form_submissions表
psql "$DATABASE_URL" << 'EOF'
CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_customer_id ON form_submissions(customer_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON form_submissions(submitted_at);

COMMENT ON TABLE form_submissions IS '表单提交记录表';

EOF

echo "✅ form_submissions表创建成功"

echo ""
echo "📝 填充测试数据..."
echo "======================================"

# 填充customers表测试数据
psql "$DATABASE_URL" << 'EOF'
INSERT INTO customers (name, email, phone, status, tags, follow_up_date)
VALUES 
  ('张三', 'zhangsan@example.com', '13800138000', 'new', '{"VIP","已咨询"}', NOW() + INTERVAL '3 days'),
  ('李四', 'lisi@example.com', '13900139000', 'contacted', '{"普通"}', NOW() + INTERVAL '5 days'),
  ('王五', 'wangwu@example.com', '14000140000', 'interested', '{"VIP"}', NOW() + INTERVAL '2 days'),
  ('赵六', 'zhaoliu@example.com', '14100141000', 'negotiating', '{"重点跟进"}', NOW() + INTERVAL '7 days'),
  ('孙七', 'sunqi@example.com', '14200142000', 'closed', '{"已成交"}', NOW()),
  ('周八', 'zhouba@example.com', '14300143000', 'lost', '{"已流失"}', NULL),
  ('吴九', 'wujiu@example.com', '14400144000', 'new', '{"新客户"}', NOW() + INTERVAL '1 days'),
  ('郑十', 'zhengshi@example.com', '14500145000', 'contacted', '{"待跟进"}', NOW() + INTERVAL '4 days'),
  ('何十一', 'heshiyi@example.com', '14600146000', 'interested', '{"高意向"}', NOW() + INTERVAL '3 days'),
  ('贾十二', 'jiashier@example.com', '14700147000', 'negotiating', '{"谈判中"}', NOW() + INTERVAL '6 days')
ON CONFLICT DO NOTHING;

EOF

echo "✅ 客户测试数据插入成功 (10条记录)"

# 填充campaigns表测试数据
psql "$DATABASE_URL" << 'EOF'
INSERT INTO campaigns (name, description, type, status, content)
VALUES 
  ('春节促销活动', '春节特惠，折扣5折起', 'email', 'active', '春节快乐！特别优惠...'),
  ('新产品发布', '推送新产品信息', 'sms', 'active', '新产品上线，立即了解！'),
  ('客户回访', '定期客户满意度调查', 'push', 'paused', '感谢您的支持，请给我们反馈'),
  ('会员福利', '会员专属优惠券', 'email', 'completed', '会员福利到期提醒'),
  ('品牌宣传', '品牌形象宣传活动', 'sms', 'active', '了解我们的品牌故事')
ON CONFLICT DO NOTHING;

EOF

echo "✅ 营销活动测试数据插入成功 (5条记录)"

# 填充forms表测试数据
psql "$DATABASE_URL" << 'EOF'
INSERT INTO forms (title, description, fields, status)
VALUES 
  (
    '客户反馈表',
    '收集客户对服务的反馈意见',
    '[
      {"id":"name","type":"text","label":"姓名","required":true},
      {"id":"email","type":"email","label":"邮箱","required":true},
      {"id":"rating","type":"select","label":"满意度","options":[{"label":"很满意","value":"5"},{"label":"满意","value":"4"},{"label":"一般","value":"3"},{"label":"不满意","value":"2"},{"label":"很不满意","value":"1"}]},
      {"id":"feedback","type":"textarea","label":"反馈内容","required":true}
    ]'::jsonb,
    'published'
  ),
  (
    '产品咨询表',
    '客户对产品的咨询和需求',
    '[
      {"id":"name","type":"text","label":"姓名","required":true},
      {"id":"phone","type":"phone","label":"电话","required":true},
      {"id":"product","type":"select","label":"感兴趣的产品","options":[{"label":"产品A","value":"productA"},{"label":"产品B","value":"productB"}]},
      {"id":"message","type":"textarea","label":"具体需求","required":false}
    ]'::jsonb,
    'published'
  ),
  (
    '员工入职表',
    '新员工入职信息收集',
    '[
      {"id":"name","type":"text","label":"姓名","required":true},
      {"id":"startDate","type":"date","label":"入职日期","required":true},
      {"id":"department","type":"text","label":"部门","required":true}
    ]'::jsonb,
    'draft'
  )
ON CONFLICT DO NOTHING;

EOF

echo "✅ 表单模板测试数据插入成功 (3条记录)"

echo ""
echo "======================================"
echo "✅ 数据库初始化完成！"
echo "======================================"
echo ""
echo "📊 数据库统计:"
psql "$DATABASE_URL" -c "SELECT 'customers' AS table_name, COUNT(*) AS count FROM customers UNION ALL SELECT 'campaigns', COUNT(*) FROM campaigns UNION ALL SELECT 'forms', COUNT(*) FROM forms;"

echo ""
echo "💡 后续步骤:"
echo "  1. 运行开发服务器: pnpm dev"
echo "  2. 访问应用: http://localhost:3000"
echo "  3. 尝试创建/编辑客户、活动、表单"
echo ""
echo "🔍 如需重置数据库:"
echo "  psql \$DATABASE_URL -c 'DROP TABLE IF EXISTS form_submissions, forms, campaigns, customers CASCADE;'"
echo ""
