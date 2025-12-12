// Типизация данных, которые возвращает Telegram
export interface User {
  id: string
  email: string
  wallet_current?: strin
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
  access_token: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  status?: "idle" | "loading" | "success" | "error"
  activeWallet: string | null
}

interface RegisterData {
  email: string
  password: string
}
interface LoginData {
  email: string
  password: string
}

export interface RegistrationError {
  message?: string
  errors?: {
    [key: string]: string
  }
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
