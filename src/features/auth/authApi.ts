import axios, { AxiosError } from "axios";
import { ChangePasswordDto, LoginData, RegisterData, User } from "./type";
import { apiUrl } from "../../App";

// Настройка инстанса для автоматической подстановки токена (опционально, но удобно)
const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: { "Content-Type": "application/json" }
});

// Интерцептор для добавления токена
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const register = async (user: RegisterData): Promise<User> => {
  try {
    // Проверьте путь! В NestJS мы делали '/auth/register'
    const res = await axiosInstance.post(`/auth/register`, user);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        // Возвращаем сообщение об ошибке с бэкенда
        throw new Error(error.response?.data?.message || "Registration failed");
    }
    throw error;
  }
}

export async function loginUser(login: LoginData): Promise<User> {
  try {
    const res = await axiosInstance.post(`/auth/login`, login);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw error;
  }
}

export async function userLogout() {
   // Обычно логаут на сервере JWT stateless не нужен, но если есть роут:
   // return axiosInstance.post('/auth/logout');
   return true; 
}

// Заглушки (реализуйте по аналогии)
export function fechUserId(userId: string): Promise<User> { throw new Error("Not implemented"); }
export function fechUserByEmail(email: string): Promise<User> { throw new Error("Not implemented"); }
export function fechNewPwd(obj: ChangePasswordDto) { throw new Error("Not implemented"); }