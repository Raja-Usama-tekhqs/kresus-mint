import MagicProvider from '@/components/magic/MagicProvider';
import Login from '@/components/Login/Login';
import { AppProps } from 'next/app';

export default function Home({ Component, pageProps }: AppProps) {
  return <Login />;
}
//  const token : any = await magic?.auth.loginWithEmailOTP({ email , showUI: false });
//checks if the email is sent or not
//  token
//   .on('email-otp-sent', () => {
//     console.log('email-otp-sent ---------')
//     //navigate to the verification page < token>
//   }) // @ts-ignore
//   ?.on('error', reason => {

//     console.log(reason.code)
//   })
//   .on('settled', () => {
//     console.log('settled ---------')
//   })
// //  recieves the otp
// token?.emit('verify-email-otp', code)
// token?.on('invalid-email-otp', () => {

// })
// // @ts-ignore
// ?.on('done', async (result: string) => {

// })
// // @ts-ignore
// ?.on('error', reason => {

// })
// ?.on('settled', () => {
//   // is called when the Promise either resolves or rejects
// })
//  verification
