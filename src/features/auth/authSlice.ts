// features/auth/authSlice.ts
import {
  buildCreateSlice,
  asyncThunkCreator,
  PayloadAction,
} from "@reduxjs/toolkit"
import {
  AuthState,
  ChangePasswordDto,
  LoginData,
  RegisterData,
  User,
} from "./type"
import {
  fechNewPwd,
  fechUserByEmail,
  loginUser,
  register,
  userLogout,
} from "./authApi"
import { fetchUserProfile, updateUserAccount } from "../user/userApi"
import { UserUpdateDto } from "../user/type"

const createSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
})

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  activeWallet: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: create => ({
    setActiveWallet: create.reducer(
      (state, action: PayloadAction<string | null>) => {
        state.activeWallet = action.payload
      },
    ),
    registrationUserAsync: create.asyncThunk(
      async (userReg: RegisterData) => {
        const response = await register(userReg)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
        },
        fulfilled: (state, action) => {
          state.user = action.payload
          state.token = action.payload.access_token
          state.isAuthenticated = true
          state.isLoading = true
          state.status = "success"
        },
        rejected: (state, action) => {
          state.status = "error"
        },
      },
    ),
    resetError: create.reducer(state => {
      state.error = ""
    }),
    login: create.asyncThunk(
      async (userLog: LoginData) => {
        const response = await loginUser(userLog)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
        },
        fulfilled: (state, action) => {
          state.user = action.payload
          state.token = action.payload.access_token
          state.isAuthenticated = true
          state.isLoading = true
          state.status = "success"
        },
        rejected: (state, action) => {
          state.status = "error"
        },
      },
    ),
    logout: create.asyncThunk(
      async () => {
        const response = await userLogout()
        return response
      },
      {
        pending: state => {
          state.status = "loading"
        },
        fulfilled: state => {
          state.user = initialState.user
          state.status = "idle"
        },
        rejected: (state, action) => {
          state.status = "idle"
        },
      },
    ),

    changePwdAsync: create.asyncThunk(
      async (obj: ChangePasswordDto) => {
        const response = await fechNewPwd(obj)
        return response
      },
      {
        pending: () => {},
        fulfilled: state => {
          state.user = state.user
        },
        rejected: (state, action) => {
          state.error = "ERROR!!!"
        },
      },
    ),
setToken: create.reducer((state, action: PayloadAction<string | null>) => {
  state.token = action.payload
  state.isAuthenticated = !!action.payload
}),
    getUserByEmail: create.asyncThunk(
      async (email: string) => {
        const response = await fechUserByEmail(email)
        return response
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          state.status = "success"
        },
        rejected: (state, action) => {
          state.error = "ERROR!!!"
        },
      },
    ),
     getUser: create.asyncThunk(
      async () => {
        const response = await fetchUserProfile()
        return response
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          state.user = action.payload
          state.status = "success"
        },
        rejected: (state, action) => {
          state.error = "ERROR!!!"
        },
      },
    ),
    updateUser: create.asyncThunk(
      async (dto: UserUpdateDto) => {
        const response = await updateUserAccount(dto)
        return response
      },
      {
        pending: () => {},
        fulfilled: (state, action) => {
          state.user = action.payload
          state.status = "success"
        },
        rejected: (state, action) => {
          state.error = "ERROR!!!"
        },
      },
    ),
  }),

  selectors: {
    selectUser: state => state.user,
    selectUserStatus: state => state.status,
  },
})

export const {
  registrationUserAsync,
  resetError,
  login,
  logout,
  changePwdAsync,
  getUserByEmail,
  setActiveWallet,
  getUser,
  updateUser,
  setToken
} = authSlice.actions
export const { selectUser, selectUserStatus } = authSlice.selectors
