import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('缺少 Supabase 环境变量配置')
}

// 在开发环境使用代理路径
const isDev = import.meta.env.DEV
const apiUrl = isDev ? 'http://localhost:5173/api' : supabaseUrl

export const supabase = createClient(apiUrl, supabaseKey)