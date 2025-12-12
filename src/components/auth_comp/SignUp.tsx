import * as React from "react"
// ... импорты MUI ...
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
// ...
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import MuiCard from "@mui/material/Card"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
// Импортируем thunk и типизацию
import {
  registrationUserAsync,
  selectUserStatus,
  resetError,
} from "../../features/auth/authSlice"
import { AppDispatch } from "../../app/store"
import { Divider, FormControl, FormLabel, Link } from "@mui/material"

// ... стили (оставляем) ...
const Card = styled(MuiCard)(/*...*/)
const SignUpContainer = styled(Stack)(/*...*/)

export default function SignUp() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const status = useSelector(selectUserStatus)

  const [emailError, setEmailError] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState(false)

  React.useEffect(() => {
    dispatch(resetError())
  }, [dispatch])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (emailError || passwordError) return

    const data = new FormData(event.currentTarget)
    // const name = data.get("name") as string // Если бэкенд поддерживает имя
    const email = data.get("email") as string
    const password = data.get("password") as string

    try {
      // Диспатчим регистрацию
      // .unwrap() вернет payload при успехе или выбросит error при ошибке
      await dispatch(registrationUserAsync({ email, password })).unwrap()

      // Редирект на главную, так как в слайсе мы уже поставили isAuthenticated = true
      navigate("/home")
    } catch (err) {
      // Ошибка обрабатывается в Redux и показывается ниже
      console.error("Registration failed", err)
    }
  }

  const validateInputs = () => {
    /* Ваш код валидации */ return true
  }

  const isLoading = status === "loading"

  return (
    <div className="container mt-5">
      <div className="row">
        <SignUpContainer
          direction="column"
          justifyContent="space-between"
          className="col-lg-4 mx-auto"
        >
          <Card variant="outlined" className="p-4">
            <Typography component="h1" variant="h4">
              Sign up
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={validateInputs}
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Sign up"}
              </Button>
            </Box>

            <Divider>or</Divider>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography sx={{ textAlign: "center" }}>
                Already have an account?{" "}
                <Link onClick={() => navigate("/")}>Sign in</Link>
              </Typography>
            </Box>
          </Card>
        </SignUpContainer>
      </div>
    </div>
  )
}
