"use client";

import { verifyEmail } from "@/actions/authActions";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Status = "loading" | "success" | "error";

const VerifyEmailPage = () => {
	const params = useParams<{ token: string }>();
	const hasRun = useRef(false);
	const [status, setStatus] = useState<Status>("loading");
	const [message, setMessage] = useState("Memverifikasi email anda...");

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const run = async () => {
			const result = await verifyEmail(params.token);
			setStatus(result.success ? "success" : "error");
			setMessage(result.message || "");
		};

		run();
	}, [params.token]);

	return (
		<div className="w-100 my-12.25 mx-auto p-5 border border-gray-300/10 rounded-lg flex flex-col gap-4">
			<h2 className="text-center font-bold text-xl">Verifikasi Email</h2>
			<p className="text-center">{message}</p>

			{status === "success" && (
				<Link href="/login" className="text-center text-blue-600">
					Lanjut ke halaman login
				</Link>
			)}
		</div>
	);
};

export default VerifyEmailPage;
