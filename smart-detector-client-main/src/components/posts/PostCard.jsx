"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
	HiOutlineThumbUp,
	HiThumbUp,
	HiOutlineChatAlt,
	HiOutlineEye,
	HiOutlineTrash,
} from "react-icons/hi";
import {
	useLikePostMutation,
	useCommentOnPostMutation,
	useDeletePostMutation,
} from "@/store/api/postsApi";
import AlertDialog from "@/components/ui/AlertDialog";

export default function PostCard({
	post,
	currentUser,
	expanded = false,
	urlPostId,
	isMyPost = false,
}) {
	const [showComments, setShowComments] = useState(expanded);
	const [commentText, setCommentText] = useState("");
	const [alertOpen, setAlertOpen] = useState(false);

	const [likePost, { isLoading: isLiking }] = useLikePostMutation();
	const [commentOnPost, { isLoading: isCommenting }] =
		useCommentOnPostMutation();
	const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

	const hasLiked = post.likes?.includes(currentUser.id);
	const canDelete =
		isMyPost ||
		post.postedBy?._id === currentUser.id ||
		post.postedBy?.id === currentUser.id;

	const postDate = new Date(post.createdAt || Date.now());
	const timeAgo = formatDistanceToNow(postDate, { addSuffix: true });

	useEffect(() => {
		if (expanded) {
			setShowComments(true);
		}
	}, [expanded]);

	const handleLike = async () => {
		if (isLiking) return;

		try {
			await likePost({
				postId: post._id,
				userId: currentUser.id,
			});
		} catch (err) {
			console.error("Failed to like post:", err);
		}
	};

	const handleComment = async (e) => {
		e.preventDefault();

		if (!commentText.trim() || isCommenting) return;

		try {
			await commentOnPost({
				postId: post._id,
				commentData: {
					text: commentText,
					user: currentUser.id,
				},
			});

			setCommentText("");
		} catch (err) {
			console.error("Failed to post comment:", err);
		}
	};

	const handleDeleteClick = (e) => {
		e.stopPropagation();
		setAlertOpen(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			await deletePost(post._id).unwrap();
			setAlertOpen(false);
		} catch (err) {
			console.error("Failed to delete post:", err);
			setAlertOpen(false);
		}
	};

	const isSuicidalPost = post.isSucidal;

	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${
				isSuicidalPost ? "border-2 border-red-500 dark:border-red-600" : ""
			}`}>
			{isSuicidalPost && (
				<div className='bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-2 text-sm font-medium flex items-center'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-5 w-5 mr-2'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
						/>
					</svg>
					This post may contain concerning content. Please reach out if you or
					someone you know needs help.
				</div>
			)}

			<div className='p-4 flex items-center justify-between'>
				<div className='flex items-center space-x-3'>
					<div className='h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden'>
						{post.postedBy?.userProfile ? (
							<Image
								src={
									process.env.NEXT_PUBLIC_API_URL + post.postedBy.userProfile
								}
								alt={post.postedBy.userName || post.postedBy.name || "User"}
								width={40}
								height={40}
								className='h-full w-full object-cover'
							/>
						) : (
							<div className='h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400'>
								{(
									post.postedBy?.userName?.[0] ||
									post.postedBy?.name?.[0] ||
									"U"
								).toUpperCase()}
							</div>
						)}
					</div>
					<div>
						<p className='font-medium text-sm'>
							{post.postedBy?.userName || post.postedBy?.name || "Anonymous"}
						</p>
						<p className='text-xs text-gray-500 dark:text-gray-400'>
							{timeAgo} •
							<span className='ml-1'>
								{post.isPublic ? "Public" : "Private"}
							</span>
						</p>
					</div>
				</div>

				{canDelete && (
					<button
						onClick={handleDeleteClick}
						disabled={isDeleting}
						className={`p-1.5 rounded-full ${
							isDeleting
								? "opacity-50 cursor-not-allowed"
								: "text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
						}`}>
						{isDeleting ? (
							<div className='w-5 h-5 border-2 border-t-transparent border-red-500 rounded-full animate-spin' />
						) : (
							<HiOutlineTrash className='w-5 h-5' />
						)}
					</button>
				)}
			</div>

			<div className='px-4 pb-3'>
				{post.title && <h2 className='text-lg font-bold mb-2'>{post.title}</h2>}
				<p className='mb-3 whitespace-pre-line'>{post.content}</p>

				{post.image && (
					<div className='mb-3 -mx-4'>
						<Image
							src={process.env.NEXT_PUBLIC_API_URL + post.image}
							alt='Post image'
							width={600}
							height={400}
							className='w-full object-cover max-h-[500px]'
						/>
					</div>
				)}

				{post.tags && post.tags.length > 0 && (
					<div className='flex flex-wrap gap-2 mb-3'>
						{post.tags.map((tag) => (
							<span
								key={tag}
								className='text-xs text-blue-600 dark:text-blue-400'>
								#{tag}
							</span>
						))}
					</div>
				)}

				{(post.likes?.length > 0 || post.comments?.length > 0) && (
					<div className='flex justify-between items-center py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700'>
						{post.likes?.length > 0 && (
							<div className='flex items-center'>
								<div className='flex justify-center items-center bg-blue-500 rounded-full w-4 h-4 mr-1'>
									<HiThumbUp className='w-2 h-2 text-white' />
								</div>
								<span>{post.likes.length}</span>
							</div>
						)}

						{post.comments?.length > 0 && (
							<button
								onClick={() => setShowComments(!showComments)}
								className='hover:underline'>
								{post.comments.length}{" "}
								{post.comments.length === 1 ? "comment" : "comments"}
							</button>
						)}
					</div>
				)}
			</div>

			<div className='px-2 py-1 flex border-b border-gray-100 dark:border-gray-700'>
				<button
					onClick={handleLike}
					disabled={isLiking}
					className={`flex-1 flex items-center justify-center py-2 rounded-lg ${
						isLiking ? "cursor-not-allowed opacity-70" : ""
					} ${
						hasLiked
							? "text-blue-500"
							: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
					}`}>
					{isLiking ? (
						<span className='w-5 h-5 mr-2 rounded-full border-2 border-blue-500 border-t-transparent animate-spin'></span>
					) : hasLiked ? (
						<HiThumbUp className='w-5 h-5 mr-2' />
					) : (
						<HiOutlineThumbUp className='w-5 h-5 mr-2' />
					)}
					Like
				</button>

				<button
					onClick={() => setShowComments(!showComments)}
					className='flex-1 flex items-center justify-center py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
					<HiOutlineChatAlt className='w-5 h-5 mr-2' />
					Comment
				</button>

				{!expanded && (
					<button
						onClick={() => {
							// Navigate to single post view
							if (
								typeof window !== "undefined" &&
								window.setContentTab &&
								window.setSelectedPostId
							) {
								window.setContentTab(4);
								window.setSelectedPostId(post._id || post.id);
							}
						}}
						className='flex-1 flex items-center justify-center py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
						<HiOutlineEye className='w-5 h-5 mr-2' />
						View
					</button>
				)}
			</div>

			{showComments && (
				<div className='px-4 py-3'>
					<div className='mb-4 space-y-4'>
						{post.comments && post.comments.length > 0 ? (
							post.comments.map((comment, index) => (
								<div key={index} className='flex space-x-2'>
									<div className='h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden flex-shrink-0'>
										{comment.user?.userProfile ? (
											<Image
												src={
													process.env.NEXT_PUBLIC_API_URL +
													comment.user.userProfile
												}
												alt={comment.user.userName || "User"}
												width={32}
												height={32}
												className='h-full w-full object-cover'
											/>
										) : (
											<div className='h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs'>
												{(
													comment.user?.userName?.[0] ||
													comment.user?.name?.[0] ||
													"U"
												).toUpperCase()}
											</div>
										)}
									</div>
									<div className='flex-1'>
										<div className='bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2'>
											<p className='text-xs font-medium'>
												{comment.user?.userName ||
													comment.user?.name ||
													"Anonymous"}
											</p>
											<p className='text-sm'>{comment.text}</p>
										</div>
										<div className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
											{comment.createdAt &&
												formatDistanceToNow(new Date(comment.createdAt), {
													addSuffix: true,
												})}
										</div>
									</div>
								</div>
							))
						) : (
							<p className='text-center text-sm text-gray-500 dark:text-gray-400 py-2'>
								No comments yet. Be the first to comment!
							</p>
						)}
					</div>

					<form
						onSubmit={handleComment}
						className='flex items-center space-x-2'>
						<div className='h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden flex-shrink-0'>
							{currentUser?.userProfile ? (
								<Image
									src={
										process.env.NEXT_PUBLIC_API_URL + currentUser.userProfile
									}
									alt={currentUser.userName || "User"}
									width={32}
									height={32}
									className='h-full w-full object-cover'
								/>
							) : (
								<div className='h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs'>
									{(
										currentUser?.userName?.[0] ||
										currentUser?.name?.[0] ||
										"U"
									).toUpperCase()}
								</div>
							)}
						</div>
						<div className='flex-1 relative'>
							<input
								type='text'
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
								placeholder='Write a comment...'
								className='w-full px-4 py-2 pr-12 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
							<button
								type='submit'
								disabled={!commentText.trim() || isCommenting}
								className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 ${
									!commentText.trim() || isCommenting
										? "text-gray-400 cursor-not-allowed"
										: "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
								}`}>
								{isCommenting ? (
									<div className='w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin'></div>
								) : (
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
										/>
									</svg>
								)}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				isOpen={alertOpen}
				onClose={() => setAlertOpen(false)}
				onConfirm={handleDeleteConfirm}
				title='Delete Post'
				description='Are you sure you want to delete this post? This action cannot be undone.'
				confirmText='Delete'
				cancelText='Cancel'
				confirmButtonClass='bg-red-600 hover:bg-red-700'
				isConfirmLoading={isDeleting}
			/>
		</div>
	);
}
