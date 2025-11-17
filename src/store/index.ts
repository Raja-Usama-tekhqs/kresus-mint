import { init, RematchDispatch, RematchRootState } from '@rematch/core';

import immerPlugin from '@rematch/immer';
import { models, RootModel } from './model';

export const store = init({
  models: models,
  //   @ts-ignore
  plugins: [immerPlugin()],
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
