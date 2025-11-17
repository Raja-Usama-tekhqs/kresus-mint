import { createModel } from '@rematch/core';

import { RootModel } from '.';
import { IUser } from '../../types/interfaces';
import { getCurrentUser } from '@/pages/api/apiCalls';
import axios from 'axios';

interface IState {
  loading: boolean;
  user: IUser | null;
  email: string;
  vault_address: string;
  wldWallet_address: string;
}

export const auth = createModel<RootModel>()({
  name: 'auth',
  state: {
    loading: false,
    user: null,
    email: '',
    vault_address: '',
    wldWallet_address: '',
  } as IState,
  reducers: {
    setEmail(state, payload: string) {
      state.email = payload;
    },
    setLoading(state, payload: boolean) {
      state.loading = payload;
    },
    setUser(state, payload: IUser | null) {
      state.user = payload;
    },
    setVaultAddress(state, payload: string) {
      state.vault_address = payload;
    },
    setWLDWallet_address(state, payload: string) {
      state.wldWallet_address = payload;
    },
  },
  effects: dispatch => ({
    async handleGetUser() {
      try {
        dispatch.auth.setLoading(true);
        const res: any = await getCurrentUser();
        const user: IUser = {
          email: res.data.user.email,
          publicAddress: res.data.user.vaultAddress,
          isMfaEnabled: true,
          issuer: 'did:ethr:' + res.data.user.vaultAddress,
          phoneNumber: null,
          recoveryFactors: [],
          is_subscription: res.data.user?.is_subscription,
          is_verified: res.data.user?.is_verified,
          is_white_listed: res.data.user?.is_white_listed,
        };
        dispatch.auth.setVaultAddress(res.data.user.vaultAddress);
        console.log(user);
        dispatch.auth.setUser(user);

        dispatch.nft.handleGetNfts(res.data.user.vaultAddress);
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          if (err.response?.data.message === 'Unauthorized User.') {
            localStorage.clear();
            window.location.href = '/';
          }
        }
      } finally {
        dispatch.auth.setLoading(false);
      }
    },
  }),
});
