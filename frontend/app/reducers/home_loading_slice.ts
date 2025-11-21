import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface LoadingState {
  value: Boolean;
}

const initialState: LoadingState = {value: false};

const homeLoadingSlicer = createSlice({
  name: 'homeLoading',
  initialState: initialState,
  reducers: {
    showLoading: state => {
      state.value = true;
    },
    hideLoading: state => {
      state.value = false;
    },
  },
});

export const {showLoading, hideLoading} = homeLoadingSlicer.actions;
export default homeLoadingSlicer.reducer;