import React, { useState } from "react"
import { useAppSelector } from "../../app/hooks"
import { selectUser } from "../../features/auth/authSlice"
import { useQueryClient } from "@tanstack/react-query"
import { apiUrl } from "../../App"

const WalletPlatformWorker = () => {
  const user = useAppSelector(selectUser)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      setLoading(true)
      setStatus("Подготовка файла...")

      try {
        // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---

        // 1. Создаем объект FormData для отправки файлов
        const formData = new FormData()
        formData.append("file", file) // 'file' должно совпадать с FileInterceptor('file') на сервере
        formData.append("userId", user?.id || "")
        formData.append("title", file.name) // Или отдельный input для названия

        setStatus("Отправка файла на сервер платформы...")
        const response = await fetch(
          `${apiUrl}/api/artworks/register-platform`,
          {
            method: "POST",
            body: formData,
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || data.error || "Ошибка сервера")
        }

        setStatus(`Успешно! Транзакция платформы: ${data.txHash}`)
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
  }

  return (
    <div className="card p-4 border-primary">
      <h5 className="text-primary">Режим: Кошелек Платформы (Gasless)</h5>
      <p className="text-muted small">
        Вы не платите комиссию. Запись будет принадлежать платформе.
      </p>
      <input
        type="file"
        onChange={handleFileChange}
        className="form-control"
        disabled={loading}
      />
      {loading && <p className="mt-2 text-info">Обработка сервером...</p>}
      <p className="mt-2">{status}</p>
    </div>
  )
}

export default WalletPlatformWorker
