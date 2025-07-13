"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/features/authSlice";
import {
	useSearchUsersQuery,
	useGetFriendsQuery,
} from "@/store/api/friendsApi";
import { HiSearch } from "react-icons/hi";
import UserCard from "./UserCard";

export default function UserSearch() {
	const currentUser = useSelector(selectUser);
	const userId = currentUser?.id || currentUser?._id;
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedTerm, setDebouncedTerm] = useState("");

	const { data: friendsList = [] } = useGetFriendsQuery(userId, {
		skip: !userId,
	});

	const friendIds = friendsList.map((friend) => friend._id);

	const { data: searchResults, isLoading } = useSearchUsersQuery(
		{
			searchQuery: debouncedTerm,
			excludeUserId: userId,
		},
		{
			skip: debouncedTerm.length < 2,
		},
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedTerm(searchTerm);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	return (
		<div className='space-y-4'>
			<div className='relative'>
				<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
					<HiSearch className='h-5 w-5 text-gray-400' />
				</div>
				<input
					type='text'
					placeholder='Search for users...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
				/>
			</div>

			{searchTerm.length > 0 && (
				<div className='mt-4'>
					{isLoading ? (
						<div className='flex justify-center py-4'>
							<div className='w-6 h-6 border-t-2 border-blue-500 rounded-full animate-spin'></div>
						</div>
					) : searchResults && searchResults.length > 0 ? (
						<div className='space-y-3'>
							{searchResults.map((user) => (
								<UserCard
									key={user._id}
									user={user}
									isFriend={friendIds.includes(user._id)}
								/>
							))}
						</div>
					) : debouncedTerm.length >= 2 ? (
						<p className='text-center py-4 text-gray-500 dark:text-gray-400'>
							No users found
						</p>
					) : null}
				</div>
			)}
		</div>
	);
}
