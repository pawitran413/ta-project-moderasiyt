"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
	NoYoutubeChannel:
		"Akun Google ini tidak memiliki channel YouTube yang bisa ditautkan.",
	YoutubeChannelFetchFailed:
		"Gagal mengambil data channel YouTube. Silakan coba lagi.",
	ChannelAlreadyLinked: "Channel YouTube ini sudah ditautkan ke akun lain.",
	AccountNotFound: "Akun tidak ditemukan. Silakan daftar terlebih dahulu.",
	GoogleEmailNotVerified:
		"Email akun Google ini belum terverifikasi oleh Google. Gunakan akun Google lain atau metode login lainnya.",
	OAuthAccountNotLinked:
		"Email ini sudah terdaftar dengan metode login lain. Silakan login menggunakan metode tersebut.",
	EmailNotVerified:
		"Email Anda belum diverifikasi. Silakan cek inbox email Anda, atau minta kirim ulang tautan verifikasi.",
	Default: "Terjadi kesalahan saat proses autentikasi. Silakan coba lagi.",
};

const ErrorContent = () => {
	const searchParams = useSearchParams();
	const errorCode = searchParams.get("error") || "Default";
	const message = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;

	return (
		<div className="w-100 my-12.25 mx-auto p-5 border border-gray-300/10 rounded-lg flex flex-col gap-4">
			<h2 className="text-center font-bold text-xl">Terjadi Kesalahan</h2>
			<p className="text-center">{message}</p>
			<div className="flex justify-center gap-4 mt-2">
				<Link href="/login" className="text-blue-600">
					Ke halaman login
				</Link>
			</div>
		</div>
	);
};

const ErrorPage = () => {
	return (
		<Suspense>
			<ErrorContent />
		</Suspense>
	);
};

export default ErrorPage;
