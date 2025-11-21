import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface LoadingState {
  value: Boolean;
}

const initialState: LoadingState = {value: false};

const loadingSlicer = createSlice({
  name: 'loading',
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

export const {showLoading, hideLoading} = loadingSlicer.actions;
export default loadingSlicer.reducer;
