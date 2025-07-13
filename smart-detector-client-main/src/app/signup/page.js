"use client";

import { useState } from "react";
import { useSignupMutation } from "@/store/api/authApi";
import { useDispatch } from "react-redux";
import {
	loginStart,
	loginSuccess,
	loginFailure,
} from "@/store/features/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		dob: "",
		phone: "",
		address: "",
		postalZip: "",
		region: "",
		country: "",
	});
	const [error, setError] = useState("");
	const [signup, { isLoading }] = useSignupMutation();
	const dispatch = useDispatch();
	const router = useRouter();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		const { name, email, password, confirmPassword, postalZip } = formData;

		if (!name || !email || !password || !postalZip) {
			setError("Name, email, password, and postal/zip code are required");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long");
			return;
		}

		dispatch(loginStart());

		try {
			const result = await signup({
				name: name,
				email,
				password,
				dob: formData.dob || undefined,
				userNumber: formData.phone || undefined,
				address: formData.address || undefined,
				postalZip,
				region: formData.region || undefined,
				country: formData.country || undefined,
				role: "user",
			}).unwrap();

			if (!result.success) {
				throw new Error(result.message || "Signup failed");
			}

			dispatch(loginSuccess(result));
			router.push("/");
		} catch (err) {
			console.error("Signup error:", err);
			const errorMessage =
				err.data?.message || err.message || "Signup failed. Please try again.";
			dispatch(loginFailure(errorMessage));
			setError(errorMessage);
		}
	};

	return (
		<div className='flex min-h-screen flex-col items-center justify-center p-2 sm:p-4 bg-background'>
			<div className='w-full max-w-md sm:max-w-lg rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black p-4 sm:p-6 shadow-lg'>
				<h1 className='mb-4 text-2xl font-bold text-center'>Create Account</h1>

				{error && (
					<div className='mb-3 rounded bg-red-100 dark:bg-red-900/30 p-2 text-red-800 dark:text-red-200 text-sm'>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-3'>
					<div>
						<label htmlFor='name' className='block mb-1 text-sm font-medium'>
							Full Name <span className='text-red-500'>*</span>
						</label>
						<input
							type='text'
							id='name'
							name='name'
							value={formData.name}
							onChange={handleChange}
							className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
							placeholder='John Doe'
							required
						/>
					</div>

					<div>
						<label htmlFor='email' className='block mb-1 text-sm font-medium'>
							Email Address <span className='text-red-500'>*</span>
						</label>
						<input
							type='email'
							id='email'
							name='email'
							value={formData.email}
							onChange={handleChange}
							className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
							placeholder='you@example.com'
							required
						/>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label
								htmlFor='password'
								className='block mb-1 text-sm font-medium'>
								Password <span className='text-red-500'>*</span>
							</label>
							<input
								type='password'
								id='password'
								name='password'
								value={formData.password}
								onChange={handleChange}
								className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
								placeholder='••••••••'
								required
							/>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block mb-1 text-sm font-medium'>
								Confirm Password <span className='text-red-500'>*</span>
							</label>
							<input
								type='password'
								id='confirmPassword'
								name='confirmPassword'
								value={formData.confirmPassword}
								onChange={handleChange}
								className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
								placeholder='••••••••'
								required
							/>
						</div>
					</div>

					<div>
						<label htmlFor='dob' className='block mb-1 text-sm font-medium'>
							Date of Birth
						</label>
						<input
							type='date'
							id='dob'
							name='dob'
							value={formData.dob}
							onChange={handleChange}
							className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
						/>
					</div>

					<div>
						<label htmlFor='phone' className='block mb-1 text-sm font-medium'>
							Phone Number
						</label>
						<input
							type='tel'
							id='phone'
							name='phone'
							value={formData.phone}
							onChange={handleChange}
							className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
							placeholder='+1 (123) 456-7890'
						/>
					</div>

					<div>
						<label htmlFor='address' className='block mb-1 text-sm font-medium'>
							Address
						</label>
						<input
							type='text'
							id='address'
							name='address'
							value={formData.address}
							onChange={handleChange}
							className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
							placeholder='123 Main St, Apt 4B'
						/>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label
								htmlFor='postalZip'
								className='block mb-1 text-sm font-medium'>
								Postal/Zip Code <span className='text-red-500'>*</span>
							</label>
							<input
								type='text'
								id='postalZip'
								name='postalZip'
								value={formData.postalZip}
								onChange={handleChange}
								className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
								placeholder='12345'
								required
							/>
						</div>

						<div>
							<label
								htmlFor='region'
								className='block mb-1 text-sm font-medium'>
								Region/State
							</label>
							<input
								type='text'
								id='region'
								name='region'
								value={formData.region}
								onChange={handleChange}
								className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
								placeholder='California'
							/>
						</div>
					</div>

					<div>
						<label htmlFor='country' className='block mb-1 text-sm font-medium'>
							Country
						</label>
						<input
							type='text'
							id='country'
							name='country'
							value={formData.country}
							onChange={handleChange}
							className='w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20'
							placeholder='United States'
						/>
					</div>

					<button
						type='submit'
						disabled={isLoading}
						className='w-full rounded-md bg-foreground text-background py-2 font-medium transition-colors hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50'>
						{isLoading ? "Creating Account..." : "Sign Up"}
					</button>
				</form>

				<div className='mt-5 text-center text-sm'>
					Already have an account?{" "}
					<Link
						href='/login'
						className='text-blue-600 dark:text-blue-400 hover:underline'>
						Log in
					</Link>
				</div>
			</div>
		</div>
	);
}
