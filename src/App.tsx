import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"
import { Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "./app/store"
import Home from "./components/main/Home"
import SignIn from "./components/auth_comp/SignIn"
import ProfilePage from "./components/profile_comp/ProfilePage"
import ProtectedRoute from "./components/auth_comp/ProtectedRoute"
import SignUp from "./components/auth_comp/SignUp"
import { useEffect } from "react"
import { getUser, setToken } from "./features/auth/authSlice"
import { getUrl } from "./utils/config"

declare global {
  interface Window {
    ethereum?: any
  }
}

export const CONTRACT_ADDRESS_V1 = import.meta.env.VITE_CONTRACT_ADDRESS_V1 || ""
export const CONTRACT_ADDRESS_V2 = import.meta.env.VITE_CONTRACT_ADDRESS_V2 || "0xf6E909b358225Cf4F024c4e0CA888CDe2478C7EC"
export const apiUrl = getUrl()

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

    useEffect(() => {
    if (import.meta.env.VITE_DEV_MODE == "true") {
      const token = import.meta.env.VITE_DEV_TOKEN;

      if (token) {
        localStorage.setItem("token", token);
        dispatch(setToken(token));
        dispatch(getUser())
      }
    }
  }, []);
  
  useEffect(() => {
    const { ethereum } = window

    if (ethereum) {
      // 1. Проверяем, какой кошелек подключен прямо сейчас (при загрузке страницы)
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            dispatch(setWallet(accounts[0]))
          } else {
            dispatch(setWallet(""))
          }
        })

      // 2. Слушаем событие переключения аккаунта в MetaMask
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          console.log("MetaMask переключился на:", accounts[0])
          dispatch(setWallet(accounts[0]))
        } else {
          // Пользователь отключил все счета
          console.log("MetaMask отключен")
          dispatch(setWallet(""))
        }
      }

      // Подписываемся на событие
      ethereum.on("accountsChanged", handleAccountsChanged)

      // Удаляем подписку при размонтировании (уход со страницы)
      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [dispatch])

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <SignIn />
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <SignUp />
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/walet_self"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/walet-platform"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
function setWallet(arg0: string): any {
  throw new Error("Function not implemented.")
}
