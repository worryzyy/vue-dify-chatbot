-- 创建 dify_apps 表用于存储用户的 Dify 应用配置
CREATE TABLE dify_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  icon_url TEXT,
  app_type TEXT DEFAULT 'Dify',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 RLS 策略，只允许用户管理自己的应用
ALTER TABLE dify_apps ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的应用
CREATE POLICY "Users can view own dify apps" ON dify_apps
FOR SELECT USING (auth.uid() = auth_user_id);

-- 用户只能插入自己的应用
CREATE POLICY "Users can insert own dify apps" ON dify_apps
FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- 用户只能更新自己的应用
CREATE POLICY "Users can update own dify apps" ON dify_apps
FOR UPDATE USING (auth.uid() = auth_user_id);

-- 用户只能删除自己的应用
CREATE POLICY "Users can delete own dify apps" ON dify_apps
FOR DELETE USING (auth.uid() = auth_user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dify_apps_updated_at
    BEFORE UPDATE ON dify_apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();