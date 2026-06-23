"use client";

import ChannelStatus from "@/components/ChannelStatus";
import EmptyScanState from "@/components/EmptyScanState";
import Modal from "@/components/Modal";
import ResultTable from "@/components/ResultTable";
import ScanForm from "@/components/ScanForm";
import ScanSummary from "@/components/ScanSummary";
import { useHideComments } from "@/hooks/useHideComments";
import { useLinkedNotification } from "@/hooks/useLinkedNotification";
import { useScanVideo } from "@/hooks/useScanVideo";
import downloadToCsv from "@/utils/downloadToCsv";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

const DashboardClient = ({ session }: { session: Session }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { linkedSuccess } = useLinkedNotification();
	const {
		hasilPrediksi,
		ownerCurrentVideo,
		isScanLoading,
		scanError,
		handleSubmit,
	} = useScanVideo();
	const {
		spamCommentIds,
		isHideLoading,
		hideError,
		hideSuccess,
		handleHideComments,
	} = useHideComments({
		hasilPrediksi,
		ownerCurrentVideo,
		youtubeChannelId: session.user.youtubeChannelId,
		onNotLinked: () => setIsModalOpen(true),
	});

	useEffect(() => {
		document.body.style.overflow = isModalOpen ? "hidden" : "unset";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isModalOpen]);

	const feedbackMessage = hideSuccess || linkedSuccess;
	const errorMessage = scanError || hideError;

	return (
		<>
			{isModalOpen && <Modal setIsModalOpen={setIsModalOpen} />}
			<div className="flex flex-col gap-8 items-center w-full px-4 py-10">
				<ChannelStatus
					userName={session.user.name ?? ""}
					isLinked={Boolean(session.user.youtubeChannelId)}
				/>

				<ScanForm isScanLoading={isScanLoading} onSubmit={handleSubmit} />

				{(errorMessage || feedbackMessage) && (
					<div className="w-full max-w-100">
						{errorMessage && (
							<div className="border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center rounded-lg px-4 py-2.5">
								{errorMessage}
							</div>
						)}
						{feedbackMessage && (
							<div className="border border-green-500/30 bg-green-500/10 text-green-400 text-sm text-center rounded-lg px-4 py-2.5">
								{feedbackMessage}
							</div>
						)}
					</div>
				)}

				{hasilPrediksi.length === 0 ? (
					<EmptyScanState />
				) : (
					<>
						<ScanSummary hasilPrediksi={hasilPrediksi} />

						<div className="flex flex-wrap gap-3 justify-center">
							{spamCommentIds.length > 0 && (
								<button
									type="button"
									disabled={isHideLoading}
									className="px-6 py-1.5 bg-red-500 text-white rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
									onClick={handleHideComments}
								>
									{isHideLoading
										? "Processing..."
										: `Sembunyikan ${spamCommentIds.length} komentar spam`}
								</button>
							)}
							<button
								onClick={() => downloadToCsv(hasilPrediksi)}
								className="px-6 py-1.5 border border-white/20 text-white rounded-full cursor-pointer hover:bg-white/5 transition-colors"
							>
								Unduh hasil prediksi
							</button>
						</div>

						<ResultTable hasilPrediksi={hasilPrediksi} />
					</>
				)}
			</div>
		</>
	);
};

export default DashboardClient;
