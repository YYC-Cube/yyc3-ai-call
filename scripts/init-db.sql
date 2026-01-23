-- YYC³ AI Intelligent Calling - 数据库初始化脚本
-- 执行时间: Docker 容器启动时自动执行
-- 作用: 创建数据库、设置权限、启用扩展

-- 创建数据库 (如果不存在)
SELECT 'CREATE DATABASE yyc_ai_calling'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'yyc_ai_calling')\gexec

-- 连接到目标数据库
\c yyc_ai_calling;

-- 启用必要的 PostgreSQL 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID 生成
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- 文本相似度搜索
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- GIN 索引优化
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- GIST 索引优化

-- 创建自定义函数: 更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 授予用户权限
GRANT ALL PRIVILEGES ON DATABASE yyc_ai_calling TO yyc_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO yyc_admin;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO yyc_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO yyc_admin;

-- 输出确认信息
\echo '✅ Database initialized successfully!'
\echo '📦 Extensions enabled: uuid-ossp, pg_trgm, btree_gin, btree_gist'
\echo '🔐 Permissions granted to yyc_admin'
