import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {IChefProfile, IUser} from '../types';

interface UserState {
  user: IUser;
}

const initialState: UserState = {
  user: {},
};

export const userSlice = createSlice({
  initialState,
  name: 'user',
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    setIsPending: (state, action: PayloadAction<1 | 0>) => {
      if (state.user) {
        state.user.is_pending = action.payload;
      }
    },
  },
});

export const {setUser} = userSlice.actions;
export default userSlice.reducer;
