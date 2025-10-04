
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  email_verified: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string;
  refreshToken: string;
  user: User | null;
  isLoading: boolean;
  pendingVerification: {
    email: string;
    isRegistration: boolean;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: "",
  refreshToken: "",
  user: null,
  isLoading: false,
  pendingVerification: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    userRegistration: (state, action: PayloadAction<{email: string}>) => {
      state.pendingVerification = {
        email: action.payload.email,
        isRegistration: true,
      };
      state.isLoading = false;
    },
    userLoggedIn: (state, action: PayloadAction<{accessToken: string; refreshToken: string; user: User}>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.pendingVerification = null;
      state.isLoading = false;
    },
    userLoggedOut: (state) => {
      state.isAuthenticated = false;
      state.accessToken = "";
      state.refreshToken = "";
      state.user = null;
      state.pendingVerification = null;
      state.isLoading = false;
    },
    tokenRefreshed: (state, action: PayloadAction<{accessToken: string}>) => {
      state.accessToken = action.payload.accessToken;
    },
    setPendingVerification: (state, action: PayloadAction<{email: string; isRegistration: boolean}>) => {
      state.pendingVerification = action.payload;
      state.isLoading = false;
    },
    clearPendingVerification: (state) => {
      state.pendingVerification = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  }
});

export const {
  setLoading,
  userRegistration,
  userLoggedIn,
  userLoggedOut,
  tokenRefreshed,
  setPendingVerification,
  clearPendingVerification,
  updateUser
} = authSlice.actions;

export default authSlice.reducer;