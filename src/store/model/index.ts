import { Models } from '@rematch/core';

import { auth } from './auth';
import { nft } from './nft';
import { utils } from './utils';

export interface RootModel extends Models<RootModel> {
  auth: typeof auth;
  nft: typeof nft;
  utils: typeof utils;
}

export const models: RootModel = {
  auth,
  nft,
  utils,
};
