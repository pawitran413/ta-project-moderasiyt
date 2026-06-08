"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import GoogleIcon from "./icons/GoogleIcon";

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
								<GoogleIcon />
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
