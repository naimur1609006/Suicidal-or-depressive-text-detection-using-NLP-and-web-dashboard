import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_RETRY_ATTEMPTS = 3;
const API_CACHE_TIME = 60 * 5;

const BASE_URL =
	(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/") + "api/v1";

const customBaseQuery = (baseQueryOptions) => {
	const baseQuery = fetchBaseQuery({
		baseUrl: BASE_URL,
		prepareHeaders: (headers, { getState, endpoint, extraOptions }) => {
			const token = getState().auth?.token;

			if (token) {
				headers.set("authorization", token);
			}

			if (!extraOptions?.formData) {
				headers.set("Content-Type", "application/json");
			}

			headers.set("Accept", "application/json");

			return headers;
		},
		fetchFn: async (...args) => {
			return fetch(...args);
		},
	});

	return async (args, api, extraOptions) => {
		if (args.body instanceof FormData) {
			extraOptions = { ...extraOptions, formData: true };
		}

		const startTime = Date.now();
		let result = await baseQuery(args, api, extraOptions);
		const requestDuration = Date.now() - startTime;

		if (process.env.NODE_ENV !== "production" && requestDuration > 1000) {
			console.warn(`Slow API request: ${requestDuration}ms`, args);
		}

		if (result.error) {
			if (result.error.status === 401) {
				console.error("Authentication error - user may need to login again");
			}

			const canRetry = [500, 502, 503, 504, "FETCH_ERROR"].includes(
				result.error.status,
			);
			const attempts = extraOptions?.retry?.attempts || 0;

			if (canRetry && attempts < API_RETRY_ATTEMPTS) {
				const delay = 2 ** attempts * 1000;

				if (process.env.NODE_ENV !== "production") {
					console.log(
						`Retrying request (attempt ${
							attempts + 1
						}/${API_RETRY_ATTEMPTS}) in ${delay}ms`,
					);
				}

				await new Promise((resolve) => setTimeout(resolve, delay));

				result = await baseQuery(args, api, {
					...extraOptions,
					retry: {
						attempts: attempts + 1,
					},
				});
			}
		}

		return result;
	};
};

export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: customBaseQuery(),
	tagTypes: ["User", "Posts", "Friends"],
	endpoints: () => ({}),
	keepUnusedDataFor: API_CACHE_TIME,
	refetchOnMountOrArgChange: 30,
	refetchOnFocus: process.env.NODE_ENV === "production",
	refetchOnReconnect: true,
});

export const {
	util: { getRunningQueriesThunk },
} = baseApi;

export const baseApiMiddleware = baseApi.middleware;
