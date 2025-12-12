import React, { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchMyArtworks } from "../../features/artwork/artworkApi"
import { ArtworkDto } from "../../features/artwork/type"
import EditArtworkModal from "../modals/EditArtworkModal"
import ArtworkCard from "./ArtworkCard"
import TransferRightsModal from "../modals/TransferRightsModal"
import { BrowserProvider, ethers } from "ethers"
import { apiUrl, CONTRACT_ADDRESS_V2 } from "../../App"
import CONTRACT_ABI from "../../../abi.json"

const PdfList: React.FC = () => {
  const queryClient = useQueryClient()
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferArtwork, setTransferArtwork] = useState<ArtworkDto | null>(
    null,
  )

  const { data, isLoading, isError, error } = useQuery<ArtworkDto[], Error>({
    queryKey: ["myArtworks"],
    queryFn: fetchMyArtworks,
  })

  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkDto | null>(
    null,
  )
  const [modalOpen, setModalOpen] = useState(false)

  const handleOpenTransfer = (artwork: ArtworkDto) => {
    setTransferArtwork(artwork)
    setTransferOpen(true)
  }

  const openEditModal = (artwork: ArtworkDto) => {
    setSelectedArtwork(artwork)
    setModalOpen(true)
  }

  const handleTransferRights = async (newOwner: string, fileHash: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS_V2,
        CONTRACT_ABI,
        signer,
      )

      const tx = await contract.transferOwnership(fileHash, newOwner)
      await tx.wait()

      const token = localStorage.getItem("token")

      await fetch(`${apiUrl}/api/artworks/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileHash,
          newOwnerAddress: newOwner,
          txHash: tx.hash,
        }),
      })

      queryClient.invalidateQueries({ queryKey: ["myArtworks"] })
    } catch (err) {
      console.error(err)
      alert("Ошибка передачи прав")
    }
  }

  return (
    <div>
      <EditArtworkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        artwork={selectedArtwork}
      />

      {transferArtwork && (
        <TransferRightsModal
          open={transferOpen}
          onClose={() => setTransferOpen(false)}
          artwork={transferArtwork}
          onSubmit={handleTransferRights}
        />
      )}

      {isLoading && <div>Загрузка...</div>}
      {isError && <div>Ошибка: {error.message}</div>}
      {!data || (data.length === 0 && <div>У вас пока нет произведений.</div>)}

      <div>
        {data?.map(artwork => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onTransfer={handleOpenTransfer}
            onEdit={() => openEditModal(artwork)}
          />
        ))}
      </div>
    </div>
  )
}

export default PdfList
