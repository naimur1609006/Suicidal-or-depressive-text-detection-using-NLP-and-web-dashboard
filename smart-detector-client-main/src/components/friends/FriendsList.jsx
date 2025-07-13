"use client";

import { useSelector } from "react-redux";
import { selectUser } from "@/store/features/authSlice";
import { useGetFriendsQuery } from "@/store/api/friendsApi";
import UserCard from "./UserCard";

export default function FriendsList() {
  const user = useSelector(selectUser);
  const userId = user?.id || user?._id;
  
  const { data: friends, isLoading, error } = useGetFriendsQuery(userId, {
    skip: !userId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading friends list.</p>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <p className="text-gray-600 dark:text-gray-300">No friends yet. Search for users to add them as friends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <UserCard key={friend._id} user={friend} isFriend={true} />
      ))}
    </div>
  );
}