import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { createWrapper } from "next-redux-wrapper";
import { baseApi, baseApiMiddleware } from "./api/baseApi";
import authReducer from "./features/authSlice";
import loggerMiddleware from "./middleware/logger";

const rootReducer = combineReducers({
	[baseApi.reducerPath]: baseApi.reducer,
	auth: authReducer,
});

const createMiddleware = (getDefaultMiddleware) => {
	const middleware = getDefaultMiddleware({
		serializableCheck: process.env.NODE_ENV !== "production",
		immutableCheck: { warnAfter: 300 },
	}).concat(baseApiMiddleware);

	if (process.env.NODE_ENV !== "production") {
		return middleware.concat(loggerMiddleware);
	}

	return middleware;
};

const makeStore = () => {
	const store = configureStore({
		reducer: rootReducer,
		middleware: createMiddleware,
		devTools: process.env.NODE_ENV !== "production",
	});

	setupListeners(store.dispatch);

	return store;
};

export const wrapper = createWrapper(makeStore, {
	debug: process.env.NODE_ENV === "development",
});

export const store = makeStore();

export * from "./features/authSlice";
