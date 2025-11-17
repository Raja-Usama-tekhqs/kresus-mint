// /pages/api/siwe-verify.ts

import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from '@worldcoin/minikit-js';
import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import { parse } from 'cookie';

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    // Parse the request body as JSON
    const { payload, nonce } = req.body as IRequestPayload;

    // Parse the cookies from the request headers
    const cookies = parse(req.headers.cookie || '');

    // Check if the nonce matches the stored nonce in cookies
    if (nonce !== cookies['siwe']) {
      return res.status(400).json({
        status: 'error',
        isValid: false,
        message: 'Invalid nonce',
      });
    }

    // Validate the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce);

    // Return the validation result
    return res.status(200).json({
      status: 'success',
      isValid: validMessage.isValid,
    });
  } catch (error: any) {
    // Handle any errors during validation or processing
    return res.status(500).json({
      status: 'error',
      isValid: false,
      message: error.message,
    });
  }
}
