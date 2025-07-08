import { get, post, put, del } from '../utils/http-client'

// 用户资料相关接口
export interface UserProfile {
  id: string
  auth_user_id: string
  email: string
  name?: string
  avatar?: string
  provider: string
  created_at: string
  updated_at: string
}

export interface UpdateProfileRequest {
  name?: string
  avatar?: string
}

export const userApi = {
  // 获取用户资料
  getProfile: () => 
    get<UserProfile>('/user/profile'),
  
  // 更新用户资料
  updateProfile: (data: UpdateProfileRequest) => 
    put<UserProfile>('/user/profile', data),
  
  // 删除用户账户
  deleteAccount: () => 
    del('/user/account'),
  
  // 修改密码
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    post('/user/change-password', data),
  
  // 上传头像
  uploadAvatar: (file: File) => 
    post('/user/upload-avatar', { avatar: file }),
}