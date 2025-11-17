// File: pages/api/verify.ts
import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from '@worldcoin/minikit-js';
import type { NextApiRequest, NextApiResponse } from 'next';

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    // Handle any other HTTP method
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { payload, action, signal } = req.body as IRequestPayload;
    const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_{string}`;

    // Verify the proof
    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal
    )) as IVerifyResponse;


    if (verifyRes.success) {
      // Handle successful verification
      return res.status(200).json({ verifyRes });
    } else {
      // Handle verification errors
      return res.status(400).json({ verifyRes });
    }
  } catch (error) {
    console.error('Error verifying proof:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
