"use client";

import hideComment from "@/actions/moderateActions";
import { scanVideo, TKomentarML } from "@/actions/scanActions";
import Modal from "@/components/Modal";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

const DashboardClient = ({ session }: { session: Session }) => {
	const [hasilPrediksi, setHasilPrediksi] = useState<TKomentarML[]>([]);
	const [isScanLoading, setIsScanLoading] = useState(false);
	const [isHideLoading, setIsHideLoading] = useState(false);
	const [error, setError] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	console.log(session.user);

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
			console.error(result.message);
			setIsScanLoading(false);
			return;
		}

		if (result.data.hasil_analisis_ml.length == 0) {
			setError("No comments on this video");
			setIsScanLoading(false);
			return;
		}

		setHasilPrediksi(result.data.hasil_analisis_ml);
		event.target.reset();
		setIsScanLoading(false);
	};

	const spamCommentId = hasilPrediksi
		.filter((comment) => comment.prediksi_svm_utama.label === "Spam")
		.map((comment) => String(comment.komentar_id));
	// console.log(spamCommentId);

	const handleHideComments = async () => {
		if (spamCommentId.length == 0) return;
		console.log(session.user);
		if (!session.user.youtubeChannelId) {
			setIsModalOpen(true);
			return;
		}

		setIsHideLoading(true);
		setError("");
		try {
			const result = await hideComment(spamCommentId);
			console.log(result);
			if (!result.success) {
				setError(result.message);
				return;
			}
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
						{isScanLoading ? "Processing..." : "Scan"}
					</button>
				</form>

				{error && <p className="text-center">{error}</p>}

				{spamCommentId.length > 0 && (
					<button
						type="button"
						disabled={isHideLoading}
						className="w-80 py-1.5 bg-white text-black rounded-full cursor-pointer mt-3 mx-auto"
						onClick={handleHideComments}
					>
						{isHideLoading ? "Processing..." : "Hide spam comments"}
					</button>
				)}

				{/* <button
					className="w-80 py-1.5 bg-white text-black rounded-full cursor-pointer mt-3 mx-auto"
					onClick={() => setIsModalOpen(true)}
				>
					Open Modal
				</button> */}

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
