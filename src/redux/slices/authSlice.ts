import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService, type Credentials, type Registration } from '@/api/authService';
import { clearSession, readSession, writeSession } from '@/services/sessionStorage';
import type { AuthSession } from '@/types';

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  session: null,
  isLoading: false,
  error: null,
  initialized: false,
};

export const restoreSession = createAsyncThunk('auth/restore', readSession);
export const signIn = createAsyncThunk('auth/login', async (credentials: Credentials) => {
  const session = await authService.login(credentials);
  await writeSession(session);
  return session;
});
export const signUp = createAsyncThunk('auth/register', async (details: Registration) => {
  const session = await authService.register(details);
  await writeSession(session);
  return session;
});
export const signOut = createAsyncThunk('auth/logout', async () => {
  await clearSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { clearAuthError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.session = action.payload;
        state.initialized = true;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.initialized = true;
        state.error = action.error.message ?? 'Saved sign-in could not be restored.';
      })
      .addCase(signIn.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(signUp.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Sign in failed.';
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Registration failed.';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.session = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.error.message ?? 'Could not clear the saved session.';
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
