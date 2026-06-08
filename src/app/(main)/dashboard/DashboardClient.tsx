"use client";

import Modal from "@/components/Modal";
import ResultTable from "@/components/ResultTable";
import ScanForm from "@/components/ScanForm";
import { useHideComments } from "@/hooks/useHideComments";
import { useLinkedNotification } from "@/hooks/useLinkedNotification";
import { useScanVideo } from "@/hooks/useScanVideo";
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
			<div className="flex flex-col gap-7">
				<div>
					<p>Login as: {session.user.name}</p>
					{session.user.youtubeChannelId ? (
						<p className="text-green-500">Channel YouTube terhubung</p>
					) : (
						<p>Channel YouTube belum ditautkan</p>
					)}
				</div>

				<ScanForm isScanLoading={isScanLoading} onSubmit={handleSubmit} />

				{errorMessage && <p className="text-center">{errorMessage}</p>}
				{feedbackMessage && (
					<p className="text-green-500 text-center">{feedbackMessage}</p>
				)}

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

				<ResultTable hasilPrediksi={hasilPrediksi} />
			</div>
		</>
	);
};

export default DashboardClient;
