import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create a simple slice to ensure we have a valid reducer
const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        isLoading: false,
    },
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setLoading } = uiSlice.actions;

export const store = configureStore({
    reducer: {
        ui: uiSlice.reducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
