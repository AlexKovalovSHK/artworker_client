export interface CreateWalletDto {
  address: string;
  label?: string;
  signature: string;
  message: string;
}

export interface WalletRespDto {
  id: string;
  address: string; // Адрес кошелька (0x...) уникален глобально
  label?: string; // Например: "MetaMask", "Ledger", "Рабочий"
  userId: string;
}