-- ============================================================
-- 龙掌柜 AI 助手 - 数据库初始化脚本
-- ============================================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    avatar TEXT,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户画像
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_platforms TEXT[] DEFAULT '{}',
    product_categories TEXT[] DEFAULT '{}',
    target_markets TEXT[] DEFAULT '{}',
    business_type VARCHAR(100),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT '新对话',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- 会话消息
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- 对话记忆（简化版 messages，用于 agent 记忆）
CREATE TABLE IF NOT EXISTS chat_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    skill_type VARCHAR(100),
    skill_result TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_memories_user_session ON chat_memories(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_chat_memories_created ON chat_memories(created_at);

-- 知识库
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);

-- 素材管理
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(50),
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);

-- 商品管理
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    category VARCHAR(100),
    images TEXT[] DEFAULT '{}',
    platform VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- 店铺管理
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    marketplace VARCHAR(100),
    shop_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);

-- Listing 优化记录
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    platform VARCHAR(50),
    original_content TEXT,
    optimized_content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- 收藏夹
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);

-- 订阅 / 账单
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'CNY',
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);

-- 工作空间
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(100) PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    name VARCHAR(200) DEFAULT '默认工作空间',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    file_count INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workspaces_session ON workspaces(session_id);

-- 插入默认测试用户 (password: 123456)
INSERT INTO users (id, email, password, name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@lzg.com', '123456', '管理员', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (user_id, preferred_platforms, product_categories, target_markets, business_type)
VALUES ('00000000-0000-0000-0000-000000000001', '{Amazon,TikTok Shop}', '{家居,电子,服饰}', '{美国,欧洲}', '跨境电商')
ON CONFLICT DO NOTHING;
