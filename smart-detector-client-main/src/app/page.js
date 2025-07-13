"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import {
	selectIsAuthenticated,
	selectUser,
	logout,
} from "@/store/features/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import {
	useGetPostsQuery,
	useGetMyPostsQuery,
	useGetPostByIdQuery,
} from "@/store/api/postsApi";
import {
	useGetCurrentUserQuery,
	useUpdateUserProfileMutation,
} from "@/store/api/authApi";
import PostCreator from "@/components/posts/PostCreator";
import PostCard from "@/components/posts/PostCard";
import UserSearch from "@/components/friends/UserSearch";
import FriendsList from "@/components/friends/FriendsList";
import {
	HiOutlineHome,
	HiOutlineUser,
	HiOutlineChat,
	HiOutlineBell,
	HiOutlineMenu,
	HiX,
	HiOutlinePencil,
	HiOutlineCheck,
} from "react-icons/hi";
import {
	TabsContainer,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
} from "@/components/ui/CustomTabs";

export default function Home() {
	const searchParams = useSearchParams();
	const urlPostId = searchParams.get("post");
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const user = useSelector(selectUser);
	const dispatch = useDispatch();
	const router = useRouter();
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showUserSearch, setShowUserSearch] = useState(false);
	const { data: posts, isLoading: postsLoading } = useGetPostsQuery();
	const { data: myPosts, isLoading: myPostsLoading } = useGetMyPostsQuery(
		user?.id || user?._id,
		{
			skip: !user?.id && !user?._id,
		},
	);
	const {
		data: userData,
		isLoading: userLoading,
		refetch: refetchUser,
	} = useGetCurrentUserQuery();
	const [updateUserProfile, { isLoading: isUpdating }] =
		useUpdateUserProfileMutation();

	// Tab states
	const [contentTab, setContentTab] = useState(0);
	const [friendsTab, setFriendsTab] = useState(0);
	const [selectedPostId, setSelectedPostId] = useState(null);

	useEffect(() => {
		if (urlPostId) {
			setSelectedPostId(urlPostId);
			setContentTab(4);
		} else {
			setSelectedPostId(null);
		}
	}, [urlPostId]);

	const { data: singlePost, isLoading: singlePostLoading } =
		useGetPostByIdQuery(selectedPostId, {
			skip: !selectedPostId,
		});

	// For inline profile editing
	const [isEditing, setIsEditing] = useState(false);
	const [editableData, setEditableData] = useState({
		name: "",
		dob: "",
		phone: "",
		address: "",
		postalZip: "",
		region: "",
		country: "",
	});
	const [isSaving, setSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	useEffect(() => {
		if (userData) {
			setEditableData({
				name: userData.name || "",
				dob: userData.dob || "",
				phone: userData.phone || "",
				address: userData.address || "",
				postalZip: userData.postalZip || "",
				region: userData.region || "",
				country: userData.country || "",
			});
		}
	}, [userData]);

	const handleLogout = () => {
		dispatch(logout());
	};

	const handleProfileEdit = () => {
		setIsEditing(true);
	};

	const handleProfileCancel = () => {
		setIsEditing(false);
		// Reset editable data to original values
		if (userData) {
			setEditableData({
				name: userData.name || "",
				dob: userData.dob || "",
				phone: userData.phone || "",
				address: userData.address || "",
				postalZip: userData.postalZip || "",
				region: userData.region || "",
				country: userData.country || "",
			});
		}
	};

	const handleProfileSave = async () => {
		setSaving(true);
		try {
			await updateUserProfile({
				id: userData.id || userData._id,
				userData: editableData,
			}).unwrap();

			// Show success state briefly then return to normal
			setSaving(false);
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 2000);
			setIsEditing(false);
			refetchUser();
		} catch (error) {
			console.error("Failed to update profile:", error);
			setSaving(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setEditableData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
		}

		// Expose state setters to window object for PostCard component to use
		if (typeof window !== "undefined") {
			window.setContentTab = setContentTab;
			window.setSelectedPostId = setSelectedPostId;
		}

		// Cleanup function to remove the window properties when component unmounts
		return () => {
			if (typeof window !== "undefined") {
				delete window.setContentTab;
				delete window.setSelectedPostId;
			}
		};
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<p className='text-gray-600 dark:text-gray-300'>
					Redirecting to login...
				</p>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-100 dark:bg-gray-900'>
			{/* Top Navigation */}
			<header className='sticky top-0 z-10 bg-white dark:bg-gray-800 shadow'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16'>
						<div className='flex-shrink-0 flex items-center'>
							<h1 className='text-xl font-bold text-blue-600 dark:text-blue-400'>
								Roberta
							</h1>
						</div>

						{/* Desktop Navigation */}
						<nav className='hidden md:flex space-x-8'>
							<button
								onClick={() => setContentTab(0)}
								className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
									contentTab === 0
										? "text-blue-600 dark:text-blue-400"
										: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
								}`}>
								<HiOutlineHome className='w-5 h-5 mr-1' />
								Home
							</button>
							<button
								onClick={() => setContentTab(1)}
								className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
									contentTab === 1
										? "text-blue-600 dark:text-blue-400"
										: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
								}`}>
								<HiOutlineChat className='w-5 h-5 mr-1' />
								My Posts
							</button>
							<button
								onClick={() => setContentTab(2)}
								className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
									contentTab === 2
										? "text-blue-600 dark:text-blue-400"
										: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
								}`}>
								<HiOutlineUser className='w-5 h-5 mr-1' />
								Friends
							</button>
							<button
								onClick={() => setContentTab(3)}
								className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
									contentTab === 3
										? "text-blue-600 dark:text-blue-400"
										: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
								}`}>
								<HiOutlineUser className='w-5 h-5 mr-1' />
								Profile
							</button>
						</nav>

						{/* User dropdown and mobile menu button */}
						<div className='flex items-center'>
							<button className='p-1 mr-4 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'>
								<HiOutlineBell className='w-6 h-6' />
							</button>

							<div className='relative ml-3'>
								<div className='flex items-center space-x-3'>
									<div className='h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden'>
										{user?.userProfile ? (
											<Image
												src={process.env.NEXT_PUBLIC_API_URL + user.userProfile}
												alt={user.userName || user.name || "User"}
												width={32}
												height={32}
												className='h-full w-full object-cover'
											/>
										) : (
											<div className='h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400'>
												{(
													user?.userName?.[0] ||
													user?.name?.[0] ||
													"U"
												).toUpperCase()}
											</div>
										)}
									</div>
									<button
										onClick={handleLogout}
										className='hidden md:block px-3 py-1 text-sm rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
										Logout
									</button>
								</div>
							</div>

							{/* Mobile menu button */}
							<button
								onClick={() => setShowMobileMenu(!showMobileMenu)}
								className='md:hidden ml-4 text-gray-600 dark:text-gray-300'>
								{showMobileMenu ? (
									<HiX className='w-6 h-6' />
								) : (
									<HiOutlineMenu className='w-6 h-6' />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile menu */}
				{showMobileMenu && (
					<div className='md:hidden bg-white dark:bg-gray-800 pt-2 pb-3 space-y-1 shadow-lg'>
						<button
							onClick={() => {
								setContentTab(0);
								setShowMobileMenu(false);
							}}
							className={`flex items-center w-full px-4 py-2 text-base font-medium ${
								contentTab === 0
									? "text-blue-600 dark:text-blue-400"
									: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
							}`}>
							<HiOutlineHome className='w-5 h-5 mr-3' />
							Home
						</button>
						<button
							onClick={() => {
								setContentTab(1);
								setShowMobileMenu(false);
							}}
							className={`flex items-center w-full px-4 py-2 text-base font-medium ${
								contentTab === 1
									? "text-blue-600 dark:text-blue-400"
									: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
							}`}>
							<HiOutlineChat className='w-5 h-5 mr-3' />
							My Posts
						</button>
						<button
							onClick={() => {
								setContentTab(2);
								setShowMobileMenu(false);
							}}
							className={`flex items-center w-full px-4 py-2 text-base font-medium ${
								contentTab === 2
									? "text-blue-600 dark:text-blue-400"
									: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
							}`}>
							<HiOutlineUser className='w-5 h-5 mr-3' />
							Friends
						</button>
						<button
							onClick={() => {
								setContentTab(3);
								setShowMobileMenu(false);
							}}
							className={`flex items-center w-full px-4 py-2 text-base font-medium ${
								contentTab === 3
									? "text-blue-600 dark:text-blue-400"
									: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
							}`}>
							<HiOutlineUser className='w-5 h-5 mr-3' />
							Profile
						</button>
						<button
							onClick={handleLogout}
							className='flex w-full items-center px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'>
							Logout
						</button>
					</div>
				)}
			</header>

			{/* Main content */}
			<main className='container mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-col md:flex-row md:space-x-6'>
					{/* Left sidebar */}
					<div className='hidden lg:block w-1/4 space-y-6 sticky top-20 self-start max-h-screen overflow-y-auto pb-6'>
						{/* User profile card */}
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
							<div className='flex items-center space-x-3 mb-4'>
								<div className='h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden'>
									{user?.userProfile ? (
										<Image
											src={process.env.NEXT_PUBLIC_API_URL + user.userProfile}
											alt={user.userName || user.name || "User"}
											width={48}
											height={48}
											className='h-full w-full object-cover'
										/>
									) : (
										<div className='h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400'>
											{(
												user?.userName?.[0] ||
												user?.name?.[0] ||
												"U"
											).toUpperCase()}
										</div>
									)}
								</div>
								<div>
									<p className='font-medium'>{user?.userName || user?.name}</p>
									<p className='text-sm text-gray-500 dark:text-gray-400'>
										{user?.email}
									</p>
								</div>
							</div>
							<button
								onClick={() => setContentTab(3)}
								className='block text-center w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors'>
								View Profile
							</button>
						</div>

						{/* Quick links */}
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
							<h3 className='font-medium mb-4'>Quick Links</h3>
							<nav className='space-y-2'>
								<button
									onClick={() => setContentTab(1)}
									className='flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors'>
									<HiOutlineChat className='w-5 h-5 mr-2 text-blue-500' />
									My Posts
								</button>
								<button
									onClick={() => setContentTab(2)}
									className='flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors'>
									<HiOutlineUser className='w-5 h-5 mr-2 text-green-500' />
									Friends
								</button>
								<button
									className='flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors'
									onClick={() => setShowUserSearch(!showUserSearch)}>
									<HiOutlineBell className='w-5 h-5 mr-2 text-amber-500' />
									{showUserSearch ? "Hide Friends Search" : "Find Friends"}
								</button>
							</nav>
						</div>

						{/* Friend search */}
						{showUserSearch && (
							<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
								<h3 className='font-medium mb-4'>Find Friends</h3>
								<UserSearch />
							</div>
						)}

						{/* Friends list */}
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
							<div className='flex items-center justify-between mb-4'>
								<h3 className='font-medium'>Friends</h3>
								<button
									onClick={() => setContentTab(2)}
									className='text-xs text-blue-600 dark:text-blue-400 hover:underline'>
									See All
								</button>
							</div>
							<div className='max-h-64 overflow-y-auto'>
								<FriendsList />
							</div>
						</div>
					</div>

					{/* Main feed */}
					<div className='flex-1'>
						{/* Content Tabs */}
						{contentTab === 0 && (
							<>
								{/* Post creator */}
								<div className='mb-6'>
									<PostCreator user={user} />
								</div>

								{/* Posts feed */}
								<div className='space-y-6'>
									{postsLoading ? (
										<div className='text-center py-10'>
											<div className='w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto'></div>
											<p className='mt-3 text-gray-600 dark:text-gray-300'>
												Loading posts...
											</p>
										</div>
									) : posts?.length === 0 ? (
										<div className='text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
											<p className='text-gray-600 dark:text-gray-300'>
												No posts yet. Be the first to share!
											</p>
										</div>
									) : (
										posts?.map((post) => (
											<PostCard
												key={post.id || post._id}
												post={post}
												currentUser={user}
											/>
										))
									)}
								</div>
							</>
						)}

						{/* My Posts Tab */}
						{contentTab === 1 && (
							<>
								{/* Post creator */}
								<div className='mb-6'>
									<PostCreator user={user} />
								</div>

								{/* My Posts feed */}
								<div className='space-y-6'>
									{myPostsLoading ? (
										<div className='text-center py-10'>
											<div className='w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto'></div>
											<p className='mt-3 text-gray-600 dark:text-gray-300'>
												Loading your posts...
											</p>
										</div>
									) : myPosts?.length === 0 ? (
										<div className='text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
											<p className='text-gray-600 dark:text-gray-300'>
												You haven't created any posts yet.
											</p>
										</div>
									) : (
										myPosts?.map((post) => (
											<PostCard
												key={post.id || post._id}
												post={post}
												currentUser={user}
												isMyPost={true}
											/>
										))
									)}
								</div>
							</>
						)}

						{/* Friends Tab */}
						{contentTab === 2 && (
							<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6'>
								<TabsContainer
									defaultIndex={friendsTab}
									onChange={setFriendsTab}>
									<TabList className='rounded-xl bg-gray-100 dark:bg-gray-700 p-1 space-x-1 mb-6'>
										<Tab
											index={0}
											className='w-full py-2.5 text-sm font-medium leading-5 rounded-lg flex items-center justify-center'
											activeClassName='bg-blue-500 text-white shadow'
											inactiveClassName='text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'>
											<HiOutlineUser className='w-5 h-5 mr-2' />
											My Friends
										</Tab>
										<Tab
											index={1}
											className='w-full py-2.5 text-sm font-medium leading-5 rounded-lg flex items-center justify-center'
											activeClassName='bg-blue-500 text-white shadow'
											inactiveClassName='text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'>
											<HiOutlineUser className='w-5 h-5 mr-2' />
											Find Friends
										</Tab>
									</TabList>

									<TabPanels>
										<TabPanel index={0}>
											<div>
												<h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
													My Friends
												</h2>
												<div className='space-y-3'>
													<FriendsList />
												</div>
											</div>
										</TabPanel>
										<TabPanel index={1}>
											<div>
												<h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
													Find Friends
												</h2>
												<UserSearch />
											</div>
										</TabPanel>
									</TabPanels>
								</TabsContainer>
							</div>
						)}

						{/* Profile Tab */}
						{contentTab === 3 && (
							<div className='bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6'>
								{userLoading ? (
									<div className='text-center py-10'>
										<div className='w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto'></div>
										<p className='mt-3 text-gray-600 dark:text-gray-300'>
											Loading profile...
										</p>
									</div>
								) : (
									<>
										{/* Profile header */}
										<div className='p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-blue-500'>
											<div className='flex flex-col sm:flex-row items-center'>
												<div className='h-24 w-24 rounded-full bg-white/30 overflow-hidden flex-shrink-0 mb-4 sm:mb-0 border-4 border-white shadow-lg'>
													{userData?.image ? (
														<Image
															src={
																process.env.NEXT_PUBLIC_API_URL + userData.image
															}
															alt={userData.name || "User"}
															width={96}
															height={96}
															className='h-full w-full object-cover'
														/>
													) : (
														<div className='h-full w-full flex items-center justify-center text-white text-4xl bg-blue-700'>
															{(userData?.name?.[0] || "U").toUpperCase()}
														</div>
													)}
												</div>
												<div className='sm:ml-6 text-center sm:text-left text-white'>
													<h1 className='text-2xl font-bold'>
														{userData?.name}
													</h1>
													<div className='flex items-center mt-1 text-blue-50'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															className='h-4 w-4 mr-1'
															fill='none'
															viewBox='0 0 24 24'
															stroke='currentColor'>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
															/>
														</svg>
														{userData?.email}
													</div>
													<div className='flex items-center mt-1 text-blue-100'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															className='h-4 w-4 mr-1'
															fill='none'
															viewBox='0 0 24 24'
															stroke='currentColor'>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
															/>
														</svg>
														{userData?.role}
													</div>
												</div>

												<div className='sm:ml-auto mt-4 sm:mt-0'>
													{!isEditing && (
														<button
															onClick={handleProfileEdit}
															className='flex items-center px-4 py-2 bg-white hover:bg-opacity-90 text-blue-600 rounded-lg text-sm font-medium transition-all shadow'>
															<HiOutlinePencil className='w-4 h-4 mr-1.5' />
															Edit Profile
														</button>
													)}
													{isEditing && (
														<div className='flex space-x-2'>
															<button
																onClick={handleProfileCancel}
																className='flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all'>
																<HiX className='w-4 h-4 mr-1.5' />
																Cancel
															</button>
															<button
																onClick={handleProfileSave}
																className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
																	isSaving
																		? "bg-white/20 text-white cursor-not-allowed"
																		: saveSuccess
																		? "bg-green-500 text-white"
																		: "bg-white text-blue-600 hover:bg-opacity-90 shadow"
																}`}
																disabled={isSaving}>
																{isSaving ? (
																	<>
																		<svg
																			className='animate-spin -ml-1 mr-2 h-4 w-4'
																			xmlns='http://www.w3.org/2000/svg'
																			fill='none'
																			viewBox='0 0 24 24'>
																			<circle
																				className='opacity-25'
																				cx='12'
																				cy='12'
																				r='10'
																				stroke='currentColor'
																				strokeWidth='4'></circle>
																			<path
																				className='opacity-75'
																				fill='currentColor'
																				d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
																		</svg>
																		Saving...
																	</>
																) : saveSuccess ? (
																	<>
																		<HiOutlineCheck className='w-4 h-4 mr-1.5' />
																		Saved!
																	</>
																) : (
																	<>
																		<HiOutlineCheck className='w-4 h-4 mr-1.5' />
																		Save Changes
																	</>
																)}
															</button>
														</div>
													)}
												</div>
											</div>
										</div>

										{/* Profile content */}
										<div className='p-6'>
											<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
												<div className='bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5'>
													<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															className='h-5 w-5 mr-2 text-blue-500'
															fill='none'
															viewBox='0 0 24 24'
															stroke='currentColor'>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
															/>
														</svg>
														Personal Information
													</h3>

													<div className='space-y-4'>
														<div className='relative'>
															<label
																htmlFor='name'
																className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Name
															</label>
															{isEditing ? (
																<div className='relative'>
																	<input
																		type='text'
																		id='name'
																		name='name'
																		value={editableData.name}
																		onChange={handleChange}
																		className='block w-full px-4 py-2.5 rounded-lg border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400'
																	/>
																	<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			className='h-5 w-5'
																			viewBox='0 0 20 20'
																			fill='currentColor'>
																			<path
																				fillRule='evenodd'
																				d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
																				clipRule='evenodd'
																			/>
																		</svg>
																	</div>
																</div>
															) : (
																<div className='py-2.5 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'>
																	{userData?.name || "Not provided"}
																</div>
															)}
														</div>

														<div className='relative'>
															<label className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Email (cannot be changed)
															</label>
															<div className='relative py-2.5 px-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'>
																{userData?.email}
																<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																	<svg
																		xmlns='http://www.w3.org/2000/svg'
																		className='h-5 w-5'
																		viewBox='0 0 20 20'
																		fill='currentColor'>
																		<path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
																		<path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
																	</svg>
																</div>
															</div>
														</div>

														<div className='relative'>
															<label
																htmlFor='dob'
																className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Date of Birth
															</label>
															{isEditing ? (
																<div className='relative'>
																	<input
																		type='date'
																		id='dob'
																		name='dob'
																		value={editableData.dob}
																		onChange={handleChange}
																		className='block w-full px-4 py-2.5 rounded-lg border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400'
																	/>
																	<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			className='h-5 w-5'
																			viewBox='0 0 20 20'
																			fill='currentColor'>
																			<path
																				fillRule='evenodd'
																				d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
																				clipRule='evenodd'
																			/>
																		</svg>
																	</div>
																</div>
															) : (
																<div className='py-2.5 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'>
																	{userData?.dob || "Not provided"}
																</div>
															)}
														</div>

														<div className='relative'>
															<label
																htmlFor='phone'
																className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Phone
															</label>
															{isEditing ? (
																<div className='relative'>
																	<input
																		type='tel'
																		id='phone'
																		name='phone'
																		value={editableData.phone}
																		onChange={handleChange}
																		className='block w-full px-4 py-2.5 rounded-lg border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400'
																	/>
																	<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			className='h-5 w-5'
																			viewBox='0 0 20 20'
																			fill='currentColor'>
																			<path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
																		</svg>
																	</div>
																</div>
															) : (
																<div className='py-2.5 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'>
																	{userData?.phone || "Not provided"}
																</div>
															)}
														</div>

														<div className='relative'>
															<label className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Role (cannot be changed)
															</label>
															<div className='relative py-2.5 px-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'>
																{userData?.role}
																<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																	<svg
																		xmlns='http://www.w3.org/2000/svg'
																		className='h-5 w-5'
																		viewBox='0 0 20 20'
																		fill='currentColor'>
																		<path
																			fillRule='evenodd'
																			d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
																			clipRule='evenodd'
																		/>
																	</svg>
																</div>
															</div>
														</div>
													</div>
												</div>

												<div className='bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5'>
													<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															className='h-5 w-5 mr-2 text-blue-500'
															fill='none'
															viewBox='0 0 24 24'
															stroke='currentColor'>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
															/>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
															/>
														</svg>
														Address Information
													</h3>

													<div className='space-y-4'>
														<div className='relative'>
															<label
																htmlFor='address'
																className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Address
															</label>
															{isEditing ? (
																<div className='relative'>
																	<input
																		type='text'
																		id='address'
																		name='address'
																		value={editableData.address}
																		onChange={handleChange}
																		className='block w-full px-4 py-2.5 rounded-lg border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400'
																	/>
																	<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			className='h-5 w-5'
																			viewBox='0 0 20 20'
																			fill='currentColor'>
																			<path
																				fillRule='evenodd'
																				d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
																				clipRule='evenodd'
																			/>
																		</svg>
																	</div>
																</div>
															) : (
																<div className='py-2.5 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'>
																	{userData?.address || "Not provided"}
																</div>
															)}
														</div>

														<div className='relative'>
															<label
																htmlFor='postalZip'
																className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Postal/Zip Code
															</label>
															{isEditing ? (
																<div className='relative'>
																	<input
																		type='text'
																		id='postalZip'
																		name='postalZip'
																		value={editableData.postalZip}
																		onChange={handleChange}
																		className='block w-full px-4 py-2.5 rounded-lg border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400'
																	/>
																	<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			className='h-5 w-5'
																			viewBox='0 0 20 20'
																			fill='currentColor'>
																			<path
																				fillRule='evenodd'
																				d='M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z'
																				clipRule='evenodd'
																			/>
																		</svg>
																	</div>
																</div>
															) : (
																<div className='py-2.5 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'>
																	{userData?.postalZip || "Not provided"}
																</div>
															)}
														</div>

														<div className='relative'>
															<label
																htmlFor='region'
																className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Region
															</label>
															{isEditing ? (
																<div className='relative'>
																	<input
																		type='text'
																		id='region'
																		name='region'
																		value={editableData.region}
																		onChange={handleChange}
																		className='block w-full px-4 py-2.5 rounded-lg border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400'
																	/>
																	<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			className='h-5 w-5'
																			viewBox='0 0 20 20'
																			fill='currentColor'>
																			<path d='M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z' />
																			<path d='M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' />
																		</svg>
																	</div>
																</div>
															) : (
																<div className='py-2.5 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'>
																	{userData?.region || "Not provided"}
																</div>
															)}
														</div>

														<div className='relative'>
															<label
																htmlFor='country'
																className='block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1'>
																Country
															</label>
															{isEditing ? (
																<div className='relative'>
																	<input
																		type='text'
																		id='country'
																		name='country'
																		value={editableData.country}
																		onChange={handleChange}
																		className='block w-full px-4 py-2.5 rounded-lg border-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400'
																	/>
																	<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400'>
																		<svg
																			xmlns='http://www.w3.org/2000/svg'
																			className='h-5 w-5'
																			viewBox='0 0 20 20'
																			fill='currentColor'>
																			<path
																				fillRule='evenodd'
																				d='M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z'
																				clipRule='evenodd'
																			/>
																		</svg>
																	</div>
																</div>
															) : (
																<div className='py-2.5 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'>
																	{userData?.country || "Not provided"}
																</div>
															)}
														</div>
													</div>
												</div>
											</div>
										</div>
									</>
								)}
							</div>
						)}

						{/* Single Post View */}
						{contentTab === 4 && (
							<div className='space-y-6'>
								{singlePostLoading ? (
									<div className='text-center py-10'>
										<div className='w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto'></div>
										<p className='mt-3 text-gray-600 dark:text-gray-300'>
											Loading post...
										</p>
									</div>
								) : singlePost ? (
									<>
										<div className='flex items-center mb-4'>
											<button
												onClick={() => {
													setContentTab(0);
													setSelectedPostId(null);
												}}
												className='flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-5 w-5 mr-1'
													viewBox='0 0 20 20'
													fill='currentColor'>
													<path
														fillRule='evenodd'
														d='M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z'
														clipRule='evenodd'
													/>
												</svg>
												Back to all posts
											</button>
										</div>
										<PostCard
											key={singlePost.id || singlePost._id}
											post={singlePost}
											currentUser={user}
											expanded={true}
											urlPostId={urlPostId}
										/>
									</>
								) : (
									<div className='text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow p-6'>
										<p className='text-gray-600 dark:text-gray-300'>
											Post not found
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Right sidebar - mobile and tablet responsive layout */}
					<div className='mt-6 md:mt-0 md:w-1/3 lg:hidden'>
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6'>
							<div className='flex items-center justify-between mb-4'>
								<h3 className='font-medium'>Friends</h3>
								<button
									onClick={() => setContentTab(2)}
									className='text-xs text-blue-600 dark:text-blue-400 hover:underline'>
									See All
								</button>
							</div>
							<div className='max-h-64 overflow-y-auto'>
								<FriendsList />
							</div>
						</div>

						<button
							onClick={() => setShowUserSearch(!showUserSearch)}
							className='w-full mb-6 flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow text-blue-600 dark:text-blue-400'>
							{showUserSearch ? "Hide Friend Search" : "Find Friends"}
						</button>

						{showUserSearch && (
							<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
								<h3 className='font-medium mb-4'>Find Friends</h3>
								<UserSearch />
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
