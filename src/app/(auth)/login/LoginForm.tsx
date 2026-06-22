import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/components/icons/GoogleIcon";

const ERROR_MESSAGE: Record<string, string> = {
	EmailNotVerified:
		"Email Anda belum diverifikasi. Cek kotak masuk email Anda.",
};

const LoginForm = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formElement = e.currentTarget;
		const formData = new FormData(formElement);
		const data = Object.fromEntries(formData.entries());

		try {
			const result = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
				callbackUrl,
			});

			setIsLoading(false);

			if (result?.error) {
				setError(ERROR_MESSAGE[result.error] || result.error);
				return;
			}

			router.push(callbackUrl);
			formElement.reset();
		} catch {
			setIsLoading(false);
			setError("Terjadi kesalahan");
		}
	};

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		await signIn("google", { callbackUrl });
	};

	return (
		<div className="w-100 my-12.25 mx-auto p-5 border border-gray-300/10 rounded-lg">
			<h2 className="text-center font-bold text-xl mb-4">Login</h2>
			{error && <p className="p-2 rounded-sm">{error}</p>}

			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
					{isLoading ? "Memproses..." : "Login"}
				</button>
			</form>

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
						Login dengan Google
					</>
				)}
			</button>

			<p className="text-center mt-4">
				Belum punya akun?{" "}
				<Link href={"/register"} className="text-blue-600">
					Register
				</Link>
			</p>
		</div>
	);
};

export default LoginForm;
