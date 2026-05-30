"use client";

import { registerUser } from "@/actions/authActions";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";

const RegisterPage = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formElement = e.currentTarget;
		const formData = new FormData(formElement);
		const data = Object.fromEntries(formData.entries());

		const result = await registerUser(data);

		setIsLoading(false);

		if (!result.success) {
			setError(result.message || "Terjadi kesalahan");
		} else {
			formElement.reset();
			router.push("/login");
		}
	};

	return (
		<div className="w-100 my-12.25 mx-auto p-5 border border-gray-300/10 rounded-lg">
			<h2 className="text-center font-bold text-xl mb-4">Register</h2>
			{error && <p className="p-2 rounded-sm">{error}</p>}

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
