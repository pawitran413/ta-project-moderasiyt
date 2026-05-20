"use client";

import { registerUser } from "@/actions/authActions";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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
			router.push("/auth/signin");
		}
	};

	return (
		<div>
			<h2>Register</h2>
			{error && <p className="p-2 rounded-sm">{error}</p>}

			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="name">Nama</label>
					<input type="text" name="name" id="name" required />
				</div>

				<div>
					<label htmlFor="email">Email</label>
					<input type="email" name="email" id="email" required />
				</div>

				<div>
					<label htmlFor="password">Nama</label>
					<input type="password" name="password" id="password" required />
				</div>

				<button type="submit" disabled={isLoading}>
					{isLoading ? "Memproses..." : "Daftar"}
				</button>
			</form>
		</div>
	);
};

export default RegisterPage;
