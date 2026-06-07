"use client";

import hideComment from "@/actions/moderateActions";
import { scanVideo, TKomentarML } from "@/actions/scanActions";
import Modal from "@/components/Modal";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const DashboardClient = ({ session }: { session: Session }) => {
	const { update } = useSession();
	const searchParams = useSearchParams();
	const hasRefreshed = useRef(false);

	const [hasilPrediksi, setHasilPrediksi] = useState<TKomentarML[]>([]);
	const [isScanLoading, setIsScanLoading] = useState(false);
	const [isHideLoading, setIsHideLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	// console.log(session.user);

	useEffect(() => {
		if (searchParams.get("linked") === "1" && !hasRefreshed.current) {
			hasRefreshed.current = true;
			update().then(() => {
				setSuccessMessage("Channel YouTube berhasil ditautkan");
				window.history.replaceState({}, "", "/dashboard");
			});
		}
	}, [searchParams, update]);

	useEffect(() => {
		if (isModalOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isModalOpen]);

	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();
		setIsScanLoading(true);
		setError("");
		const videoUrl = event.target.urlVideo.value;

		const result = await scanVideo(videoUrl);

		if (!result.success) {
			setError(result.message ?? "Terjadi kesalahan saat scan");
			setIsScanLoading(false);
			return;
		}

		if (result.data.hasil_analisis_ml.length == 0) {
			setError("Video ini tidak memiliki komentar");
			setIsScanLoading(false);
			return;
		}

		const labelMlData = result.data.hasil_analisis_ml.reduce(
			(acc, l) => {
				if (l.prediksi_svm_utama.label === "Spam") {
					acc.spam.push(l);
				} else {
					acc.normal.push(l);
				}
				return acc;
			},
			{ spam: [] as TKomentarML[], normal: [] as TKomentarML[] },
		);
		const filteredMlData = [...labelMlData.spam, ...labelMlData.normal];

		setHasilPrediksi(filteredMlData);
		event.target.reset();
		setIsScanLoading(false);
	};

	const spamCommentIds = hasilPrediksi
		.filter((c) => c.prediksi_svm_utama.label === "Spam")
		.map((c) => String(c.komentar_id));

	const handleHideComments = async () => {
		if (spamCommentIds.length == 0) return;

		// console.log(session.user);
		if (!session.user.youtubeChannelId) {
			setIsModalOpen(true);
			return;
		}

		setIsHideLoading(true);
		setError("");
		setSuccessMessage("");
		try {
			const result = await hideComment(spamCommentIds);
			// console.log(result);
			if (!result.success) {
				setError(result.message ?? "Gagal menyembunyikan komentar");
				return;
			}
			setSuccessMessage(
				`${result.data.success ?? spamCommentIds.length} komentar berhasil disembunyikan`,
			);
		} catch (error) {
			setError(`Terjadi kesalahan saat memproses permintaan: ${error}`);
		} finally {
			setIsHideLoading(false);
		}
	};

	return (
		<>
			{isModalOpen && <Modal setIsModalOpen={setIsModalOpen} />}
			<div className="flex flex-col gap-7">
				<div>
					<p>Login as: {session.user.name}</p>
					{session.user.youtubeChannelId ? (
						<p className="text-green-500">Channel YouTube terhubung</p>
					) : (
						<p>Channel YouTube belum ditautkan</p>
					)}
				</div>

				<form
					className="flex flex-col gap-3 w-100 mx-auto border border-white/25 p-5 rounded-lg"
					onSubmit={handleSubmit}
				>
					<div className="flex flex-col gap-1">
						<label htmlFor="urlVideo" className="px-4 text-center">
							URL Video YouTube
						</label>
						<input
							type="url"
							name="urlVideo"
							id="urlVideo"
							pattern="https:\/\/(www\.)?(youtube\.com|youtu\.be).*"
							placeholder="https://www.youtube.com/watch?v=tGv7CUutzqU"
							className="py-1.5 px-4 rounded-full border border-[#ccc]/25"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={isScanLoading}
						className="p-1.5 bg-white text-black rounded-full cursor-pointer mt-3"
					>
						{isScanLoading ? "Memproses..." : "Scan"}
					</button>
				</form>

				{error && <p className="text-center">{error}</p>}
				{successMessage && <p className="text-green-500">{successMessage}</p>}

				{spamCommentIds.length > 0 && (
					<button
						type="button"
						disabled={isHideLoading}
						className="w-80 py-1.5 bg-white text-black rounded-full cursor-pointer mt-3 mx-auto"
						onClick={handleHideComments}
					>
						{isHideLoading
							? "Processing..."
							: `Sembunyikan ${spamCommentIds.length} komentar spam`}
					</button>
				)}

				{hasilPrediksi.length > 0 && (
					<table>
						<thead>
							<tr>
								<th className="whitespace-nowrap px-2">Label SVM</th>
								<th className="whitespace-nowrap px-2">Label NB</th>
								<th>Komentar</th>
							</tr>
						</thead>
						<tbody>
							{hasilPrediksi.map((data, index) => (
								<tr
									key={index}
									className="border-b border-white/15 last:border-none"
								>
									<td
										className={`text-center ${data.prediksi_svm_utama.label == "Spam" && "text-red-600"}`}
									>
										{data.prediksi_svm_utama.label}
									</td>
									<td
										className={`text-center ${data.prediksi_nb_pembanding.label == "Spam" && "text-red-600"}`}
									>
										{data.prediksi_nb_pembanding.label}
									</td>
									<td className="pl-4 py-2">{data.teks_komentar}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</>
	);
};

export default DashboardClient;
