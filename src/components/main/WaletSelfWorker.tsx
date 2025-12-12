import { BrowserProvider, ethers, sha256 } from "ethers"
import React, { useEffect, useState } from "react"
import CONTRACT_ABI from "../../../abi.json"
import { useAppSelector } from "../../app/hooks"
import { selectUser } from "../../features/auth/authSlice"
import { useQueryClient } from "@tanstack/react-query"
import { apiUrl, CONTRACT_ADDRESS_V2 } from "../../App"

declare global {
  interface Window {
    ethereum?: any
  }
}

const WaletSelfWorker = () => {
  const user = useAppSelector(selectUser)
  const queryClient = useQueryClient()
  const [account, setAccount] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [verifyHash, setVerifyHash] = useState<string>("")
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>("")

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const chainId = network.chainId

        const sepoliaChainId = 11155111n

        if (chainId !== sepoliaChainId) {
          setStatus("Пожалуйста, переключитесь на сеть Sepolia в MetaMask.")
          return
        }

        const accounts = await provider.send("eth_requestAccounts", [])
        const accountAddress = accounts[0]
        setAccount(accountAddress)

        const signer = await provider.getSigner()
        const balance = await provider.getBalance(accountAddress)
        const formattedBalance = ethers.formatEther(balance)

        // 💡 Используем getFeeData()
        const feeData = await provider.getFeeData()

        // 💡 Безопасная обработка gasPrice, который может быть null
        const gasPriceInWei = feeData.gasPrice !== null ? feeData.gasPrice : 0n

        const gasPriceInGwei = ethers.formatUnits(gasPriceInWei, "gwei")

        console.log("--- Информация о сети ---")
        console.log("Network Name:", network.name)
        console.log("Chain ID:", network.chainId)

        console.log("\n--- Информация о кошельке ---")
        console.log("Connected Account Address:", accountAddress)
        console.log("Balance (ETH):", formattedBalance)

        console.log("\n--- Информация о подписанте ---")
        console.log("Signer Address:", await signer.getAddress())
        console.log("Current Gas Price (wei):", gasPriceInWei.toString())
        console.log("Current Gas Price (gwei):", gasPriceInGwei)

        setStatus(
          `Кошелёк подключен. Вы в сети Sepolia. Баланс: ${formattedBalance} ETH.`,
        )
      } catch (error) {
        console.error(error)
        setStatus("Ошибка при подключении кошелька.")
      }
    } else {
      setStatus("Пожалуйста, установите MetaMask!")
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    // ПРОВЕРКИ
    if (!file) return
    if (!title) {
      alert("Пожалуйста, введите название произведения перед выбором файла!")
      event.target.value = "" // Сброс инпута
      return
    }
    if (!account) {
      setStatus("Сначала подключите кошелёк.")
      return
    }

    setLoading(true)
    setStatus("Вычисляю хеш...")

    try {
      const buffer = await file.arrayBuffer()
      const hash = sha256(new Uint8Array(buffer))

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const v2Contract = new ethers.Contract(
        CONTRACT_ADDRESS_V2,
        CONTRACT_ABI,
        signer,
      )

      setStatus("Отправка транзакции в MetaMask...")
      const tx = await v2Contract.register(hash)
      setStatus(`Транзакция отправлена: ${tx.hash}. Ждем подтверждения...`)

      await tx.wait()
      setStatus(`Блокчейн подтвержден! Отправляю данные на сервер...`)

      const formData = new FormData()
      formData.append("userId", user?.id || "")
      formData.append("file", file)
      formData.append("title", title)
      formData.append("txHash", tx.hash)
      formData.append("wallet", account)
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${apiUrl}/api/artworks/register-self`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      )

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || "Ошибка сервера")
      }

      setStatus(`УСПЕХ! Файл сохранен на сервере и в блокчейне. Hash: ${hash}`)
      setTitle("") // Очистка
      event.target.value = "" // Очистка инпута файла
      queryClient.invalidateQueries({ queryKey: ["myArtworks"] })
    } catch (error) {
      console.error(error)
      setStatus(
        "Ошибка: " + (error instanceof Error ? error.message : String(error)),
      )
    } finally {
      setLoading(false)
    }
  }

  // Функция для передачи прав
  const transferOwnership = async () => {
    // 1. Валидация
    if (!verifyHash) {
      setStatus("Введите хеш файла (fileHash) для передачи.")
      return
    }
    if (!newOwnerAddress) {
      setStatus("Введите адрес нового владельца.")
      return
    }

    setLoading(true)
    setStatus("Передаю права в блокчейне...")

    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS_V2,
        CONTRACT_ABI,
        signer,
      )
      const tx = await contract.transferOwnership(verifyHash, newOwnerAddress)
      setStatus(`Транзакция отправлена: ${tx.hash}. Ждем майнинга...`)

      await tx.wait()
      setStatus(`Блокчейн подтвержден! Синхронизирую с сервером...`)
      const token = localStorage.getItem("token")

      const bodyData = {
        fileHash: verifyHash,
        newOwnerAddress: newOwnerAddress,
        txHash: tx.hash,
      }

      const response = await fetch(
        `${apiUrl}/api/artworks/transfer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        },
      )

      if (!response.ok) {
        throw new Error("Ошибка обновления на сервере")
      }

      setStatus(`УСПЕХ! Права переданы новому владельцу: ${newOwnerAddress}`)
    } catch (error) {
      console.error(error)
      setStatus(
        "Ошибка: " + (error instanceof Error ? error.message : String(error)),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    connectWallet()
  }, [])

  return (
    <div className="card p-4 mt-3 border-primary">
      {!account ? (
        <div className="text-center">
          {/* Если идет загрузка, показываем спиннер, иначе кнопку "Повторить" */}
          {loading ? (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              <p className="text-danger">{status}</p>
              <button className="btn btn-primary" onClick={connectWallet}>
                Попробовать подключить снова
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          {/* Основной интерфейс после входа */}
          <div className="alert alert-success">
            Подключен: <strong>{account}</strong>
          </div>

          <p className="small text-muted">{status}</p>
          <hr />

          <h5>Зарегистрировать произведение</h5>
          <div className="mb-3">
            <label htmlFor="artworkTitle" className="form-label">
              Название произведения
            </label>
            <input
              type="text"
              id="artworkTitle"
              className="form-control"
              placeholder="Введите название..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <input
            type="file"
            onChange={handleFileChange}
            className="form-control"
            disabled={loading}
          />
          <hr />
          <h5>Передать права</h5>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Введите хеш для передачи..."
              value={verifyHash}
              onChange={e => setVerifyHash(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Введите адрес нового владельца..."
              value={newOwnerAddress}
              onChange={e => setNewOwnerAddress(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn btn-warning"
              onClick={transferOwnership}
              disabled={loading}
            >
              Передать
            </button>
          </div>
          <p className="mt-2">{status}</p>
        </div>
      )}
    </div>
  )
}

export default WaletSelfWorker
