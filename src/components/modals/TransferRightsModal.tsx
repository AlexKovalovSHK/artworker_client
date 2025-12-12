import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { ArtworkDto } from "../../features/artwork/type"

interface Props {
  open: boolean
  onClose: () => void
  artwork: ArtworkDto
  onSubmit: (newOwner: string, fileHash: string) => Promise<void>
}

const TransferRightsModal: React.FC<Props> = ({
  open,
  onClose,
  artwork,
  onSubmit,
}) => {
  if (!artwork) return null

  const [newOwner, setNewOwner] = useState("")
  const [loading, setLoading] = useState(false)

  // Добавляем массив доступных пользователей для Select
  const users = [
    { label: "user-1", value: "0x1111111111111111111111111111111111111111" },
    { label: "user-2", value: "0x2222222222222222222222222222222222222222" },
    { label: "user-3", value: "0x3333333333333333333333333333333333333333" },
  ]

  const handleSelectChange = (event: SelectChangeEvent) => {
    setNewOwner(event.target.value)
  }

  const handleTransfer = async () => {
    if (!newOwner) {
      alert("Введите адрес нового владельца")
      return
    }

    setLoading(true)
    await onSubmit(newOwner, artwork.fileHash)
    setLoading(false)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth // заставляет Dialog занимать всю ширину, указанную через maxWidth
      maxWidth="md" // варианты: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
    >
      <DialogTitle>Передать права</DialogTitle>

      <DialogContent>
        <p style={{ marginBottom: 10 }}>
          Передаем права на произведение:
          <br />
          <strong>{artwork.title}</strong>
          <p className="mt-0">{artwork.description}</p>
        </p>

        {/* Можно ввести вручную */}
        <TextField
          label="Адрес нового владельца"
          fullWidth
          value={newOwner}
          onChange={e => setNewOwner(e.target.value)}
          disabled={loading}
          margin="normal"
        />

        {/* Или выбрать из списка */}
        <FormControl fullWidth size="small" margin="normal">
          <InputLabel id="select-owner-label">Выберите пользователя</InputLabel>
          <Select
            labelId="select-owner-label"
            value={newOwner}
            label="Выберите пользователя"
            onChange={handleSelectChange}
            disabled={loading}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {users.map(user => (
              <MenuItem key={user.value} value={user.value}>
                {user.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button onClick={handleTransfer} variant="contained" disabled={loading}>
          Передать
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransferRightsModal
