import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { WalletRespDto } from "../../features/wallets/type"
import { fetchMyWallets } from "../../features/wallets/walletsApi"
import CopyIconButton from "../CopyIconButton"

const short = (str: string, left = 6, right = 4) => {
  if (str.length <= left + right) return str
  return `${str.slice(0, left)}...${str.slice(-right)}`
}

const WalletsList: React.FC = () => {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)

  // Получаем текущий адрес из MetaMask
  useEffect(() => {
    const getConnectedAddress = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
          if (accounts.length > 0) {
            setConnectedAddress(accounts[0].toLowerCase())
          }
        } catch (err) {
          console.error("MetaMask error:", err)
        }
      }
    }

    getConnectedAddress()

    // Можно подписаться на изменение аккаунта
    window.ethereum?.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length > 0) setConnectedAddress(accounts[0].toLowerCase())
      else setConnectedAddress(null)
    })
  }, [])

  const { data, isLoading, isError, error } = useQuery<WalletRespDto[], Error>({
    queryKey: ["myWallets"],
    queryFn: fetchMyWallets,
  })

  if (isLoading) return <div>Загрузка...</div>
  if (isError) return <div>Ошибка: {error.message}</div>
  if (!data || data.length === 0) return <div>У вас пока нет кошельков.</div>

  return (
    <div className="d-flex flex-column gap-3">
      {data.map(wallet => {
        const isConnected = connectedAddress === wallet.address.toLowerCase()
        return (
          <div
            key={wallet.id}
            className={`p-3 border rounded shadow-sm`}
            style={{
              backgroundColor: isConnected ? "#d4edda" : "#ffffff",
              transition: "background-color 0.3s",
            }}
          >
            {/* ID */}
            <div className="d-flex justify-content-between mb-1">
              <div>
                <small className="text-muted">
                  <strong>ID:</strong> {short(wallet.id, 8, 7)}
                </small>
              </div>
              <CopyIconButton value={wallet.id} />
            </div>

            {/* Address */}
            <div className="d-flex justify-content-between mb-1">
              <div>
                <small className="text-muted">
                  <strong>Адрес:</strong> {short(wallet.address, 8, 6)}
                </small>
              </div>
              <CopyIconButton value={wallet.address} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WalletsList
