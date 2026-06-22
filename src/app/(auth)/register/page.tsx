"use client";

import { registerUser } from "@/actions/authActions";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/components/icons/GoogleIcon";

const RegisterPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const formElement = e.currentTarget;
		const formData = new FormData(formElement);
		const data = Object.fromEntries(formData.entries());

		const result = await registerUser(data);

		setIsLoading(false);

		if (!result.success) {
			setError(result.message || "Terjadi kesalahan");
		} else {
			formElement.reset();
			setSuccessMessage(result.message);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		await signIn("google", { callbackUrl: "/dashboard" });
	};

	return (
		<div className="w-100 my-12.25 mx-auto p-5 border border-gray-300/10 rounded-lg">
			<h2 className="text-center font-bold text-xl mb-4">Register</h2>
			{error && <p className="p-2 rounded-sm">{error}</p>}
			{successMessage && (
				<p className="p-2 rounded-sm text-green-500 text-center">
					{successMessage}
				</p>
			)}

			{!successMessage && (
				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="flex flex-col">
						<label htmlFor="name">Nama</label>
						<input
							type="text"
							name="name"
							id="name"
							required
							className="p-1 rounded-sm border border-[#ccc]/10"
						/>
					</div>

					<div className="flex flex-col">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							name="email"
							id="email"
							required
							className="p-1 rounded-sm border border-[#ccc]/10"
						/>
					</div>

					<div className="flex flex-col">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							name="password"
							id="password"
							required
							className="p-1 rounded-sm border border-[#ccc]/10"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="p-2 bg-[#4f46e5] text-white rounded-sm cursor-pointer mt-3"
					>
						{isLoading ? "Memproses..." : "Daftar"}
					</button>
				</form>
			)}

			{!successMessage && (
				<>
					<div className="flex items-center gap-3 my-4">
						<hr className="w-full text-white/20" />
						<span className="text-sm text-white/50">atau</span>
						<hr className="w-full text-white/20" />
					</div>

					<button
						type="button"
						onClick={handleGoogleSignIn}
						disabled={isGoogleLoading}
						className="w-full p-2 bg-white text-black rounded-sm cursor-pointer flex items-center justify-center gap-2"
					>
						{isGoogleLoading ? (
							"Mengarahkan..."
						) : (
							<>
								<GoogleIcon />
								Daftar dengan Google
							</>
						)}
					</button>
				</>
			)}

			<p className="text-center mt-4">
				Sudah punya akun?{" "}
				<Link href={"/login"} className="text-blue-600">
					Login
				</Link>
			</p>
		</div>
	);
};

export default RegisterPage;
