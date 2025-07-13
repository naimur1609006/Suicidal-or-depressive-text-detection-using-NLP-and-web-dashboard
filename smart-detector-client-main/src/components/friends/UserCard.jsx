"use client";

import { useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/features/authSlice";
import {
	useAddFriendMutation,
	useRemoveFriendMutation,
} from "@/store/api/friendsApi";
import { HiUserAdd, HiUserRemove } from "react-icons/hi";

export default function UserCard({ user, isFriend = false }) {
	const currentUser = useSelector(selectUser);
	const [isAdding, setIsAdding] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);

	const [addFriend] = useAddFriendMutation();
	const [removeFriend] = useRemoveFriendMutation();

	const handleAddFriend = async () => {
		if (isAdding) return;

		setIsAdding(true);
		try {
			await addFriend({
				userId: currentUser.id || currentUser._id,
				friendId: user._id,
			}).unwrap();
		} catch (error) {
			console.error("Failed to add friend:", error);
		} finally {
			setIsAdding(false);
		}
	};

	const handleRemoveFriend = async () => {
		if (isRemoving) return;

		setIsRemoving(true);
		try {
			await removeFriend({
				userId: currentUser.id || currentUser._id,
				friendId: user._id,
			}).unwrap();
		} catch (error) {
			console.error("Failed to remove friend:", error);
		} finally {
			setIsRemoving(false);
		}
	};

	return (
		<div className='flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
			<div className='flex items-center space-x-3'>
				<div className='h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden'>
					{user.userProfile || user.image ? (
						<Image
							src={
								process.env.NEXT_PUBLIC_API_URL +
								(user.userProfile || user.image)
							}
							alt={user.userName || user.name || "User"}
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
				<div>
					<p className='font-medium text-sm
					'>{user.userName || user.name}</p>
					{user.email && (
						<p className='text-xs text-gray-500 dark:text-gray-400'>
							{user.email}
						</p>
					)}
				</div>
			</div>

			{currentUser &&
				currentUser._id !== user._id &&
				(isFriend ? (
					<button
						onClick={handleRemoveFriend}
						disabled={isRemoving}
						className='flex items-center px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'>
						{isRemoving ? (
							<div className='w-4 h-4 mr-1 rounded-full border-2 border-red-500 border-t-transparent animate-spin'></div>
						) : (
							<HiUserRemove className='w-4 h-4 mr-1' />
						)}
						Remove
					</button>
				) : (
					<button
						onClick={handleAddFriend}
						disabled={isAdding}
						className='flex items-center px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'>
						{isAdding ? (
							<div className='w-4 h-4 mr-1 rounded-full border-2 border-blue-500 border-t-transparent animate-spin'></div>
						) : (
							<HiUserAdd className='w-4 h-4 mr-1' />
						)}
						Add Friend
					</button>
				))}
		</div>
	);
}
