import { baseApi } from "./baseApi";

const getUserEmail = () => {
	if (typeof window !== "undefined") {
		const user = localStorage.getItem("auth_user");
		if (user) {
			try {
				return JSON.parse(user)?.email;
			} catch (e) {
				return null;
			}
		}
	}
	return null;
};

export const authApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation({
			query: (credentials) => ({
				url: "/auth/login",
				method: "POST",
				body: credentials,
			}),
			transformResponse: (response) => {
				return response;
			},
			invalidatesTags: ["User"],
		}),
		signup: builder.mutation({
			query: (userData) => ({
				url: "/auth/signup",
				method: "POST",
				body: userData,
			}),
			transformResponse: (response) => {
				return response;
			},
			invalidatesTags: ["User"],
		}),
		getCurrentUser: builder.query({
			query: () => {
				const email = getUserEmail();
				return email ? `/auth/find-user/${email}` : "/auth/me";
			},
			transformResponse: (response) => {
				return response.data || response;
			},
			providesTags: ["User"],
		}),
		updateUserProfile: builder.mutation({
			query: ({ id, userData }) => ({
				url: `/auth/${id}`,
				method: "PATCH",
				body: userData,
			}),
			invalidatesTags: ["User"],
		}),
	}),
});

export const { 
	useLoginMutation, 
	useSignupMutation, 
	useGetCurrentUserQuery,
	useUpdateUserProfileMutation
} = authApi;
