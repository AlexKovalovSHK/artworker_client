import { useState } from "react"
import ProfilePage from "../profile_comp/ProfilePage"
import WaletSelfWorker from "./WaletSelfWorker"
import WalletPlatformWorker from "./WaletPlatformWorker"
import ContentElem from "../contents/ContentElem"
import { Box, Paper, Button, Alert, CircularProgress } from "@mui/material"
import { BrowserProvider, ethers } from "ethers"
import CONTRACT_ABI from "../../../abi.json"
import { CONTRACT_ADDRESS_V2 } from "../../App"

declare global {
  interface Window {
    ethereum?: any
  }
}

const Home = () => {
  const [mode, setMode] = useState<"self" | "platform" | null>(null)
  const [verifyHash, setVerifyHash] = useState<string>("")
  const [verifiedOwner, setVerifiedOwner] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const verifyRegistry = async () => {
    if (!verifyHash) {
      setVerifiedOwner("Введите хеш для проверки")
      return
    }

    if (!window.ethereum) {
      setVerifiedOwner("Установите MetaMask!")
      return
    }

    setLoading(true)
    try {
      const provider = new BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS_V2,
        CONTRACT_ABI,
        provider,
      )

      const owner: string = await contract.registry(verifyHash)

      if (owner === ethers.ZeroAddress) {
        setVerifiedOwner("Владелец не найден")
      } else {
        setVerifiedOwner(`Хеш зарегистрирован на: ${owner}`)
      }
    } catch (error) {
      console.error(error)
      setVerifiedOwner("Ошибка при проверке")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-lg-3 mt-2">
          <ProfilePage />
        </div>

        <Box className="col-lg-6 mt-2" sx={{ mx: "auto" }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <h3 className="text-center mb-4">
              Web3 Реестр Музыкальных Произведений
            </h3>

            {/* Кнопки выбора режима */}
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}
            >
              <Button
                variant={mode === "self" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setMode("self")}
              >
                Использовать свой MetaMask
              </Button>

              <Button
                variant={mode === "platform" ? "contained" : "outlined"}
                color="success"
                onClick={() => setMode("platform")}
              >
                Воспользоваться средствами платформы
              </Button>
            </Box>

            {/* Условный рендер */}
            <div className="mt-4">
              {!mode && (
                <p className="text-center text-muted">
                  Выберите способ регистрации.
                </p>
              )}
              {mode === "self" && <WaletSelfWorker />}
              {mode === "platform" && <WalletPlatformWorker />}
            </div>

            <hr />
            {/* Ввод хеша для проверки */}
            <div className="mb-3">
              <label htmlFor="verifyHash" className="form-label">
                Проверить хеш
              </label>
              <div className="input-group">
                <input
                  id="verifyHash"
                  type="text"
                  className="form-control"
                  placeholder="Введите хеш..."
                  value={verifyHash}
                  onChange={e => setVerifyHash(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={verifyRegistry}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : "Проверить"}
                </button>
              </div>
              <div className="form-text mt-1 ms-1">
                Вы можете скопировать хеш из истории ваших транзакций или
                деталей произведения, чтобы подтвердить его подлинность и
                владельца.
              </div>
            </div>

            {verifiedOwner && (
              <Alert variant="outlined" color="info" className="mt-2">
                {verifiedOwner}
              </Alert>
            )}
          </Paper>
        </Box>

        <div className="col-lg-3 mt-2">
          <ContentElem />
        </div>
      </div>
    </div>
  )
}

export default Home
