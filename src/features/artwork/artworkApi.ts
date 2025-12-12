// features/artwork/artworkApi.ts

import axiosInstance from "../auth/axios";
import { ArtworkDto, UpdateArtworkDto } from "./type";

export const fetchMyArtworks = async (): Promise<ArtworkDto[]> => {
  const res = await axiosInstance.get("/api/artworks/my");
  return res.data;
};

export async function updateArtworkMeta(dto: UpdateArtworkDto) {
  const { id, ...body } = dto;

  const res = await axiosInstance.patch(`/api/artworks/${id}`, body);
  return res.data;
}
