'use client';

import { PaymanClient } from '@paymanai/payman-ts';

const payman = PaymanClient.withCredentials({
  clientId: process.env.NEXT_PUBLIC_PAYMAN_CLIENT_ID!,
  clientSecret: process.env.NEXT_PUBLIC_PAYMAN_CLIENT_SECRET!,
});

export const usePayment = () => {
  const pay = async (mentorId: string, amount: number) => {
    try {
      const response = await payman.ask(`Send $${amount} to mentor ${mentorId}`);
      console.log('Payment Response:', response);
      return response;
    } catch (error) {
      console.error('Payment Error:', error);
      throw error;
    }
  };

  return { pay };
};