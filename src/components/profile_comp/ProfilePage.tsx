import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Box, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// Импорты Redux
import { useAppSelector, useAppDispatch } from '../../app/hooks'; // Ваши типизированные хуки
import { selectUser, updateUser, selectUserStatus, logout } from '../../features/auth/authSlice';
import { UserUpdateDto } from '../../features/user/type';
import { removeUserById } from '../../features/user/userApi';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Берем данные из Redux
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectUserStatus);

  const [editing, setEditing] = useState(false);
  
  // Локальный стейт формы
  const [formData, setFormData] = useState<UserUpdateDto>({
    id: '',
    email: '',
    username: '',
    first_name: '',
    last_name: ''
  });

  // Синхронизация формы с данными из Redux при загрузке
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        email: user.email,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  // Обработчик инпутов
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Сохранение изменений
  const handleSave = async () => {
    if (!user) return;
    
    try {
      // Диспатчим экшен обновления
      await dispatch(updateUser(formData)).unwrap();
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Ошибка при сохранении");
    }
  };

  // Удаление аккаунта
  const handleDelete = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
        "Вы уверены, что хотите удалить аккаунт? Это действие необратимо (но ваши транзакции останутся в блокчейне)."
    );

    if (confirmed) {
      try {
        await removeUserById(user.id)
        await dispatch(logout())
        navigate('/'); 
      } catch (error) {
        console.error("Failed to delete account", error);
        alert("Не удалось удалить аккаунт");
      }
    }
  };

  if (status === 'loading' && !user) {
     return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  }

  if (!user) {
    return <Typography>Пользователь не найден. Пожалуйста, войдите снова.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
           <Typography variant="h4">Профиль</Typography>
           {!editing && (
             <Button variant="outlined" onClick={() => setEditing(true)}>
               Edit
             </Button>
           )}
        </Box>

        <Box display="flex" flexDirection="column" gap={2} sx={{ textAlign: "left" }}>
          {editing ? (
            // РЕЖИМ РЕДАКТИРОВАНИЯ
            <>
              <TextField 
                label="Email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                fullWidth 
              />
              <TextField 
                label="Username" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                fullWidth 
              />
              <TextField 
                label="First Name" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange} 
                fullWidth 
              />
              <TextField 
                label="Last Name" 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange} 
                fullWidth 
              />
              
              <Box display="flex" gap={2} mt={2}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSave}
                    disabled={status === 'loading'}
                  >
                    Сохранить
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => setEditing(false)}
                  >
                    Отмена
                  </Button>
              </Box>
            </>
          ) : (
            // РЕЖИМ ПРОСМОТРА
            <>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Username:</strong> {user.username || 'Не указано'}</Typography>
              <Typography><strong>Имя:</strong> {user.first_name || '-'}</Typography>
              <Typography><strong>Фамилия:</strong> {user.last_name || '-'}</Typography>
              
              <Typography variant="caption" color="text.secondary" mt={2}>
                  Аккаунт создан: {new Date(user.auth_date || Date.now()).toLocaleDateString()}
              </Typography>

              <Box mt={4} pt={2} borderTop="1px solid #eee">
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleDelete}
                    size="small"
                  >
                    Удалить аккаунт
                  </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;