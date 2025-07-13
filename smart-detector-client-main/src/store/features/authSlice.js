import { createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

const getStorageItem = (key, parseJson = true) => {
	if (typeof window !== "undefined") {
		const item = localStorage.getItem(key);
		if (!item) return null;
		return parseJson ? JSON.parse(item) : item;
	}
	return null;
};

const persistedToken = getStorageItem("auth_token", false);
const persistedUser = getStorageItem("auth_user", true);

const initialState = {
	token: persistedToken || null,
	user: persistedUser || null,
	isAuthenticated: !!persistedToken,
	loading: false,
	error: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		loginStart: (state) => {
			state.loading = true;
			state.error = null;
		},
		loginSuccess: (state, action) => {
			const responseData = action.payload.data || action.payload || {};

			state.token = responseData.token || null;
			state.user = {
				id: responseData.id || "",
				email: responseData.email || "",
				role: responseData.role || "user",
				userName: responseData.userName || "",
				varified: responseData.varified || false,
				userProfile: responseData.userProfile || "",
				userNumber: responseData.userNumber || "",
			};
			state.isAuthenticated = !!responseData.token;
			state.loading = false;
			state.error = null;

			if (typeof window !== "undefined" && responseData.token) {
				localStorage.setItem("auth_token", responseData.token);
				localStorage.setItem("auth_user", JSON.stringify(state.user));
			}
		},
		loginFailure: (state, action) => {
			state.loading = false;
			state.error = action.payload;
		},
		logout: (state) => {
			state.token = null;
			state.user = null;
			state.isAuthenticated = false;

			if (typeof window !== "undefined") {
				localStorage.removeItem("auth_token");
				localStorage.removeItem("auth_user");
			}
		},
		updateUser: (state, action) => {
			if (state.user) {
				state.user = { ...state.user, ...action.payload };

				if (typeof window !== "undefined") {
					localStorage.setItem("auth_user", JSON.stringify(state.user));
				}
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			return {
				...state,
				...action.payload.auth,
			};
		});
	},
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } =
	authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user || {};

export default authSlice.reducer;
