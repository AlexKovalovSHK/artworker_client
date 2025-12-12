import * as React from "react"
// ... импорты MUI ...
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import FormLabel from "@mui/material/FormLabel"
import FormControl from "@mui/material/FormControl"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import MuiCard from "@mui/material/Card"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
// ВАЖНО: Импортируем хуки из Redux
import { useDispatch, useSelector } from "react-redux"
// ВАЖНО: Импортируем типизированный Dispatch из store (создайте его в store.ts)
// или используйте any временно, но лучше типизировать
import { AppDispatch } from "../../app/store"
import {
  login,
  resetError,
  selectUserStatus,
} from "../../features/auth/authSlice"
import ForgotPassword from "./ForgotPassword"

// ... Card и SignInContainer стили (оставляем как есть) ...
const Card = styled(MuiCard)(/*...*/)
const SignInContainer = styled(Stack)(/*...*/)

export default function SignIn() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>() // Типизируем dispatch

  // Берем данные из Redux
  const status = useSelector(selectUserStatus)

  const [emailError, setEmailError] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  // Очистка ошибок при входе на страницу
  React.useEffect(() => {
    dispatch(resetError())
  }, [dispatch])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (emailError || passwordError) return

    const data = new FormData(event.currentTarget)
    const email = data.get("email") as string
    const password = data.get("password") as string

    try {
      // 1. Вызываем Redux Action
      // .unwrap() позволяет поймать ошибку в catch, если thunk отклонен
      await dispatch(login({ email, password })).unwrap()

      // 2. Если успешно (не упало в catch) -> редирект
      navigate("/home")
    } catch (err) {
      console.error("Failed to login:", err)
      // Ошибка уже в стейте serverError, компонент перерисуется
    }
  }

  // ... validateInputs (без изменений) ...
  const validateInputs = () => {
    /* Ваш код валидации */ return true
  }

  const isLoading = status === "loading"

  return (
    <div className="container mt-5">
      <div className="row">
        <SignInContainer
          direction="column"
          justifyContent="space-between"
          className="col-lg-4 mx-auto" 
        >
          <Card variant="outlined" className="p-4">
            <Typography component="h1" variant="h4">
              Sign in
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Поля ввода (без изменений) */}
              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  required
                  fullWidth
                  error={emailError}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  id="password"
                  name="password"
                  type="password"
                  required
                  fullWidth
                  error={passwordError}
                />
              </FormControl>

              {/* Кнопка отправки */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={validateInputs}
                disabled={isLoading} // Блокируем при загрузке
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </Box>

            {/* Ссылки */}
            <Divider>or</Divider>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography sx={{ textAlign: "center" }}>
                Don&apos;t have an account?{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/register")} // Исправлено на /register
                  sx={{ alignSelf: "center" }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Card>
        </SignInContainer>
      </div>
    </div>
  )
}
