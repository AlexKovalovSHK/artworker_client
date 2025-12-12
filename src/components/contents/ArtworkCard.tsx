import React, { useState } from "react"
import { Collapse, Button } from "@mui/material"
import { ArtworkDto } from "../../features/artwork/type"
import { apiUrl } from "../../App"

interface ArtworkCardProps {
  artwork: ArtworkDto
  onEdit: () => void
  onTransfer: (artwork: ArtworkDto) => void // добавляем callback
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onEdit,
  onTransfer,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="border border-secondary rounded"
      style={{
        padding: "8px 12px",
        marginBottom: 10,
        background: "#fafafa",
        borderRadius: 6,
      }}
    >
      {/* Верхняя компактная часть */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 600 }}>{artwork.title}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ minWidth: 60, padding: "2px 6px" }}
          >
            {open ? "Скрыть" : "Подробнее"}
          </Button>
        </div>
      </div>

      {/* Скрываемый блок */}
      <Collapse in={open}>
        <div style={{ marginTop: 8 }}>
          <p style={{ marginBottom: 6 }}>{artwork.description}</p>
          <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 2 }}>
            Статус: <strong>{artwork.status}</strong>
          </p>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>
            Создано: {new Date(artwork.createdAt).toLocaleDateString()}
          </p>

          <div className="d-flex justify-content-between">
            <div>
              <a
                href={`${apiUrl}/api/artworks/view/${artwork.id}`}
                target="_blank"
                style={{ fontSize: "0.85rem" }}
              >
                Скачать / открыть
              </a>
            </div>

            <Button
              variant="outlined"
              size="small"
              onClick={() => onTransfer(artwork)} // теперь TypeScript знает о prop
              sx={{ minWidth: 60, padding: "2px 6px" }}
            >
              Передать права
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={onEdit}
              sx={{ minWidth: 60, padding: "2px 6px" }}
            >
              Edit
            </Button>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

export default ArtworkCard
