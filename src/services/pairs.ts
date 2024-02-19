import axios from 'axios';
import axiosInstance from './axios';

export const fetchPairs = async () => {
  const { data } = await axiosInstance.get('/api/pairs');

  return data;
};

interface SubscribedPair {
  contractId: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
}

export const fetchAllSubscribedPairs = async () => {
  const { data } = await axios.post<SubscribedPair[]>(
    `${process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_URL}/pairs/all?network=testnet`,
    undefined,
    {
      headers: {
        apiKey: process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY,
      },
    },
  );
  return data;
};
