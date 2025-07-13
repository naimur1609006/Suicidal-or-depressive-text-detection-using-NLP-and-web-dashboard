"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useCreatePostMutation } from "@/store/api/postsApi";
import { HiOutlinePhotograph, HiOutlineTag, HiX } from "react-icons/hi";

export default function PostCreator({ user }) {
	const [postContent, setPostContent] = useState("");
	const [postTitle, setPostTitle] = useState("");
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [tags, setTags] = useState([]);
	const [showTagInput, setShowTagInput] = useState(false);
	const [tagInput, setTagInput] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const fileInputRef = useRef(null);

	const [createPost, { isLoading }] = useCreatePostMutation();

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setImage(file);
		const reader = new FileReader();
		reader.onload = () => {
			setImagePreview(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setImage(null);
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()]);
			setTagInput("");
		}
	};

	const removeTag = (tagToRemove) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && tagInput) {
			e.preventDefault();
			handleAddTag();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!postContent.trim()) return;

		try {
			await createPost({
				title: postTitle,
				content: postContent,
				postedBy: user.id,
				image: image,
				isPublic,
				tags,
			}).unwrap();

			setPostContent("");
			setPostTitle("");
			setImage(null);
			setImagePreview(null);
			setTags([]);
			setIsPublic(true);
			if (fileInputRef.current) fileInputRef.current.value = "";
		} catch (err) {
			console.error("Failed to create post:", err);
		}
	};

	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4'>
			<div className='flex items-center space-x-4 mb-4'>
				<div className='h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden'>
					{user.userProfile ? (
						<Image
							src={process.env.NEXT_PUBLIC_API_URL + user.userProfile}
							alt={user.userName || "User"}
							width={40}
							height={40}
							className='h-full w-full object-cover'
						/>
					) : (
						<div className='h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400'>
							{(user.userName?.[0] || user.name?.[0] || "U").toUpperCase()}
						</div>
					)}
				</div>
				<div className='flex-1'>
					<p className='font-medium text-sm'>{user.userName || user.name}</p>
					<div className='flex items-center text-xs'>
						<span
							className={`mr-2 inline-block w-2 h-2 rounded-full ${
								isPublic ? "bg-green-500" : "bg-amber-500"
							}`}></span>
						<select
							value={isPublic ? "public" : "private"}
							onChange={(e) => setIsPublic(e.target.value === "public")}
							className='text-xs bg-transparent border-none p-0 cursor-pointer text-gray-500 dark:text-gray-400'>
							<option value='public'>Public</option>
							<option value='private'>Private</option>
						</select>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='Title'
					value={postTitle}
					onChange={(e) => setPostTitle(e.target.value)}
					className='w-full mb-2 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 px-0 py-1 text-gray-800 dark:text-gray-200'
				/>

				<textarea
					placeholder="What's on your mind?"
					value={postContent}
					onChange={(e) => setPostContent(e.target.value)}
					className='w-full min-h-[100px] mb-4 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none px-0 py-2 text-gray-800 dark:text-gray-200'
				/>

				{imagePreview && (
					<div className='relative mb-4'>
						<div className='max-h-60 overflow-hidden rounded-lg'>
							<Image
								src={process.env.NEXT_PUBLIC_API_URL + imagePreview}
								alt='Post image preview'
								width={400}
								height={300}
								className='w-full object-contain'
							/>
						</div>
						<button
							type='button'
							onClick={removeImage}
							className='absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white rounded-full p-1 hover:bg-opacity-100 transition-colors'>
							<HiX className='w-5 h-5' />
						</button>
					</div>
				)}

				{/* Tags */}
				{tags.length > 0 && (
					<div className='flex flex-wrap gap-2 mb-4'>
						{tags.map((tag) => (
							<div
								key={tag}
								className='bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs flex items-center'>
								#{tag}
								<button
									type='button'
									onClick={() => removeTag(tag)}
									className='ml-1 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white'>
									<HiX className='w-3 h-3' />
								</button>
							</div>
						))}
					</div>
				)}

				{showTagInput && (
					<div className='flex mb-4'>
						<input
							type='text'
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder='Add a tag and press Enter'
							className='flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
							autoFocus
						/>
						<button
							type='button'
							onClick={handleAddTag}
							className='px-3 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors'>
							Add
						</button>
					</div>
				)}

				<div className='flex items-center justify-between mt-2 border-t border-gray-200 dark:border-gray-700 pt-3'>
					<div className='flex space-x-2'>
						<button
							type='button'
							onClick={() => fileInputRef.current?.click()}
							className='flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors'>
							<HiOutlinePhotograph className='w-5 h-5 mr-1 text-green-500' />
							Photo
						</button>

						<button
							type='button'
							onClick={() => setShowTagInput(!showTagInput)}
							className='flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors'>
							<HiOutlineTag className='w-5 h-5 mr-1 text-blue-500' />
							Tag
						</button>

						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							onChange={handleImageChange}
							className='hidden'
						/>
					</div>

					<button
						type='submit'
						disabled={!postContent.trim() || isLoading}
						className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium ${
							!postContent.trim() || isLoading
								? "bg-blue-400 cursor-not-allowed"
								: "bg-blue-500 hover:bg-blue-600"
						} transition-colors`}>
						{isLoading ? "Posting..." : "Post"}
					</button>
				</div>
			</form>
		</div>
	);
}
