// /pages/api/generate-nonce.ts
import { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Generate a random UUID and remove the dashes
    const nonce = crypto.randomUUID().replace(/-/g, '');

    // Set the nonce in a secure cookie
    res.setHeader(
      'Set-Cookie',
      serialize('siwe', nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Send secure cookie in production
        sameSite: 'strict',
        path: '/',
      })
    );

    // Return the nonce in the JSON response
    return res.status(200).json({ nonce });
  } else {
    // Handle non-GET methods
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
