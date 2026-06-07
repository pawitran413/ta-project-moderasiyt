"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

const Modal = ({
	setIsModalOpen,
}: {
	setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
	const [isLinking, setIsLinking] = useState(false);

	const handleLinkChannel = async () => {
		setIsLinking(true);
		await signIn("google", { callbackUrl: "/dashboard?linked=1" });
	};

	return (
		<div
			className="inset-0 w-full h-full bg-black/50 absolute z-10 flex justify-center items-center backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					setIsModalOpen(false);
				}
			}}
		>
			<div className="w-180 h-120 p-20 bg-black border border-white/30 rounded-xl flex justify-center overflow-y-auto">
				<div className="h-fit flex flex-col justify-center items-center gap-5">
					<h1 className="text-center font-bold text-3xl">
						Tambahkan moderator dan tautkan akun YouTube
					</h1>
					<div className="flex items-center w-full gap-3">
						<hr className="w-full text-white/20" />
						<span className="text-2xl font-bold">1</span>
						<hr className="w-full text-white/20" />
					</div>
					{/* <p className="w-10 h-10 bg-white/10 text-center rounded-full text-2xl flex items-center justify-center">1</p> */}
					<p className="text-center">
						Untuk menyembunyikan komentar spam, tambahkan akun
						<i className="text-blue-600">
							{" "}
							https://www.youtube.com/@CommetSmartMod
						</i>{" "}
						sebagai moderator channel anda.
					</p>

					<Image
						src={"/add_moderator.png"}
						width={500}
						height={40}
						alt="Tambahkan moderator"
					/>

					<div className="flex items-center w-full gap-3">
						<hr className="w-full text-white/20" />
						<span className="text-2xl font-bold">2</span>
						<hr className="w-full text-white/20" />
					</div>
					<p className="text-center">
						Kemudian konfirmasi kepemilikan channel YouTube dengan klik tombol
						di bawah, dan pilih akun google pemilik channel Anda
					</p>
					<button
						onClick={handleLinkChannel}
						disabled={isLinking}
						className="mt-2 w-2/3 p-1.5 bg-white text-black rounded-full cursor-pointer flex items-center justify-center gap-2"
					>
						{isLinking ? (
							"Mengarahkan..."
						) : (
							<>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									x="0px"
									y="0px"
									width="30"
									height="30"
									viewBox="0 0 48 48"
								>
									<path
										fill="#FFC107"
										d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
									></path>
									<path
										fill="#FF3D00"
										d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
									></path>
									<path
										fill="#4CAF50"
										d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
									></path>
									<path
										fill="#1976D2"
										d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
									></path>
								</svg>
								Konfirmasi dengan google
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Modal;
