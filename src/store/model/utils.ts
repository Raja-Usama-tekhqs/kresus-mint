import { createModel } from '@rematch/core';
import { RootModel } from '.';

interface IState {
  showContestModal: boolean;
}

export const utils = createModel<RootModel>()({
  name: 'utils',
  state: {
    showContestModal: false,
  } as IState,
  reducers: {
    setShowContestModal(state, payload: boolean) {
      state.showContestModal = payload;
    },
  },
});
