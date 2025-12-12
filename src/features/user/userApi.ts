import axiosInstance from "../auth/axios";
import { User } from "../auth/type";
import { UserUpdateDto } from "./type";

// Получить текущего пользователя (GET /api/users/me)
// Токен подставится АВТОМАТИЧЕСКИ через интерцептор
export async function fetchUserProfile(): Promise<User> {
  const res = await axiosInstance.get('/api/users/profiles');
  //console.log("Current User:", res.data);
  return res.data;
}

// Получить всех пользователей (GET /api/users)
export async function fetchAllUsers(): Promise<User[]> {
  const res = await axiosInstance.get('/api/users');
  return res.data;
}

// Получить пользователя по ID (GET /api/users/:id)
export async function fetchUserById(id: string): Promise<User> {
  const res = await axiosInstance.get(`/api/users/${id}`);
  return res.data;
}

// Удалить пользователя (DELETE /api/users/:id)
export async function removeUserById(userId: string): Promise<{ deleted: boolean }> {
  const res = await axiosInstance.delete(`/api/users/${userId}`);
  return res.data;
}

// Обновить пользователя (PATCH /api/users/:id)
// В REST ID передается в URL, а данные в body
export const updateUserAccount = async (user: UserUpdateDto): Promise<User> => {
  try {
    console.log("Updating user:", user);

    const res = await axiosInstance.put(
      `/api/users`, // ID в URL
      {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        // id внутри body отправлять не обязательно, но и не ошибка
      }
    );
    console.log(res.data);
    
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}