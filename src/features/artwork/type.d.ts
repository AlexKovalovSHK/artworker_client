export interface ArtworkDto {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileHash: string;
  txHash: string;
  ownerAddress: string;
  mode: string;
  status: string;
  createdAt: Date;
}

export interface UpdateArtworkDto {
  id: string;
  title: string;
  description: string;
}