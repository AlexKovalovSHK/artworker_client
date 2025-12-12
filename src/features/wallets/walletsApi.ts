import axiosInstance from "../auth/axios";
import { CreateWalletDto, WalletRespDto } from "./type";

export const fetchMyWallets = async (): Promise<WalletRespDto[]> => {
  const res = await axiosInstance.get("/api/wallets");
  return res.data;
};

export async function fetchNewWalletCreate(dto: CreateWalletDto) {
  const res = await axiosInstance.post(`/api/wallets`, dto);
  return res.data;
}

