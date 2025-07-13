import { baseApi } from "./baseApi";

export const postsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getPosts: builder.query({
			query: () => ({
				url: "/posts?sortBy=createdAt&sortOrder=desc",
				method: "GET",
			}),
			providesTags: (result) =>
				result?.data
					? [
							...result.data.map(({ _id }) => ({ type: "Posts", id: _id })),
							{ type: "Posts", id: "LIST" },
					  ]
					: [{ type: "Posts", id: "LIST" }],
			transformResponse: (response) => response.data || [],
		}),

		getMyPosts: builder.query({
			query: (user) => ({
				url:
					"/posts/my-posts/all" +
					`?user=${user}&sortBy=createdAt&sortOrder=desc`,
				method: "GET",
			}),
			providesTags: (result) =>
				result?.data
					? [
							...result.data.map(({ _id }) => ({ type: "Posts", id: _id })),
							{ type: "Posts", id: "LIST" },
					  ]
					: [{ type: "Posts", id: "LIST" }],
			transformResponse: (response) => response.data || [],
		}),

		getPostById: builder.query({
			query: (id) => ({
				url: `/posts/${id}`,
				method: "GET",
			}),
			providesTags: (result, error, id) => [{ type: "Posts", id }],
			transformResponse: (response) => response.data || {},
		}),

		createPost: builder.mutation({
			query: (postData) => {
				const formData = new FormData();

				const postDataForForm = { ...postData };

				if (
					postDataForForm.postedBy &&
					typeof postDataForForm.postedBy === "object"
				) {
					postDataForForm.postedBy = postDataForForm.postedBy.id;
				}

				if (postData.image) {
					formData.append("image", postData.image);
					delete postDataForForm.image;
				}

				if (
					Array.isArray(postDataForForm.tags) &&
					postDataForForm.tags.length === 0
				) {
					delete postDataForForm.tags;
				}

				Object.keys(postDataForForm).forEach((key) => {
					if (key === "tags" && Array.isArray(postDataForForm[key])) {
						// Handle array of tags
						formData.append(key, JSON.stringify(postDataForForm[key]));
					} else {
						formData.append(key, postDataForForm[key]);
					}
				});

				return {
					url: "/posts",
					method: "POST",
					body: formData,
					formData: true,
				};
			},
			invalidatesTags: [{ type: "Posts", id: "LIST" }],
		}),

		likePost: builder.mutation({
			query: ({ postId, userId }) => ({
				url: `/posts/${postId}/like`,
				method: "POST",
				body: { userId },
			}),
			invalidatesTags: (result, error, { postId }) => [
				{ type: "Posts", id: postId },
				{ type: "Posts", id: "LIST" },
			],
		}),

		commentOnPost: builder.mutation({
			query: ({ postId, commentData }) => ({
				url: `/posts/${postId}/comment`,
				method: "POST",
				body: commentData,
			}),
			invalidatesTags: (result, error, { postId }) => [
				{ type: "Posts", id: postId },
				{ type: "Posts", id: "LIST" },
			],
		}),

		deletePost: builder.mutation({
			query: (postId) => ({
				url: `/posts/${postId}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, postId) => [
				{ type: "Posts", id: postId },
				{ type: "Posts", id: "LIST" },
			],
		}),
	}),
});

export const {
	useGetPostsQuery,
	useGetMyPostsQuery,
	useGetPostByIdQuery,
	useCreatePostMutation,
	useLikePostMutation,
	useCommentOnPostMutation,
	useDeletePostMutation,
} = postsApi;
