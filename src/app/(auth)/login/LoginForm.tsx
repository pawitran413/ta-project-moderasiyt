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
	const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
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
		<div className="w-screen h-screen flex justify-center items-center">
			<div className="w-100 p-5 border border-gray-300/30 rounded-lg">
				<h2 className="text-center font-bold text-xl mb-4">Login</h2>
				{error && <p className="p-2 rounded-sm">{error}</p>}

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<label htmlFor="email" className="text px-4 text-white/70">
							Email
						</label>
						<input
							type="email"
							name="email"
							id="email"
							required
							className="py-1.5 px-4 rounded-full border border-white/15 bg-transparent placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label htmlFor="password" className="text px-4 text-white/70">
							Password
						</label>
						<input
							type="password"
							name="password"
							id="password"
							required
							className="py-1.5 px-4 rounded-full border border-white/15 bg-transparent placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="p-1.5 bg-white text-black rounded-full cursor-pointer mt-5 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
					>
						{isLoading ? "Memproses..." : "Login"}
					</button>
				</form>

				<div className="flex items-center gap-3 my-4">
					<hr className="w-full text-white/20" />
					<span className="text-sm text-white/50">atau</span>
					<hr className="w-full text-white/20" />
				</div>

				<button
					type="button"
					onClick={handleGoogleSignIn}
					disabled={isGoogleLoading}
					className="w-full p-1.5 bg-white text-black rounded-full cursor-pointer flex items-center justify-center gap-2"
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
		</div>
	);
};

export default LoginForm;
