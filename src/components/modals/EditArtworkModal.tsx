import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateArtworkMeta } from "../../features/artwork/artworkApi";
import { UpdateArtworkDto, ArtworkDto } from "../../features/artwork/type";

interface Props {
  open: boolean;
  onClose: () => void;
  artwork: ArtworkDto | null;
}

const EditArtworkModal: React.FC<Props> = ({ open, onClose, artwork }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const queryClient = useQueryClient();

  // При каждом открытии модалки — подставляем текущее значение
  useEffect(() => {
    if (artwork) {
      setTitle(artwork.title);
      setDescription(artwork.description || "");
    }
  }, [artwork]);

  const mutation = useMutation({
    mutationFn: updateArtworkMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myArtworks"] });
      onClose();
    },
  });

  const handleSave = () => {
    if (!artwork) return;

    const dto: UpdateArtworkDto = {
      id: artwork.id,
      title,
      description
    };

    mutation.mutate(dto);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Редактировать метаданные</DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <TextField
          label="Название"
          fullWidth
          margin="dense"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label="Описание"
          fullWidth
          multiline
          rows={3}
          margin="dense"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSave} disabled={mutation.isPending}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditArtworkModal;
