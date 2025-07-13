import { baseApi } from "./baseApi";

export const friendsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getFriends: builder.query({
			query: (userId) => ({
				url: `/auth/friends/${userId}`,
				method: "GET",
			}),
			providesTags: ["Friends"],
			transformResponse: (response) => response.data?.friends || [],
		}),

		searchUsers: builder.query({
			query: ({ searchQuery, excludeUserId }) => ({
				url: `/auth/search/users?query=${encodeURIComponent(searchQuery)}${
					excludeUserId ? `&excludeUserId=${excludeUserId}` : ""
				}`,
				method: "GET",
			}),
			transformResponse: (response) => response.data || [],
		}),

		addFriend: builder.mutation({
			query: ({ userId, friendId }) => ({
				url: "/auth/add-friend/profile",
				method: "POST",
				body: { userId, friendId },
			}),
			invalidatesTags: ["Friends"],
		}),

		removeFriend: builder.mutation({
			query: ({ userId, friendId }) => ({
				url: "/auth/remove-friend/profile",
				method: "POST",
				body: { userId, friendId },
			}),
			invalidatesTags: ["Friends"],
		}),
	}),
});

export const {
	useGetFriendsQuery,
	useSearchUsersQuery,
	useAddFriendMutation,
	useRemoveFriendMutation,
} = friendsApi;
