"use server";

import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ModerationHistory from "@/models/ModerationHistory";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

type TPrediksiLabel = {
	label: "Spam" | "Normal";
	confidence_score: number;
};

export type TKomentarML = {
	komentar_id: string;
	username_pengirim: string;
	teks_komentar: string;
	timestamp_komentar: string;
	prediksi_svm_utama: TPrediksiLabel;
	prediksi_nb_pembanding: TPrediksiLabel;
};

type TMLResponse = {
	video_id?: string;
	video_url: string;
	judul_video?: string;
	channel_id: string;
	hasil_analisis_ml: TKomentarML[];
};

type TScanResult =
	| { success: true; data: TMLResponse }
	| { success: false; message: string };

export async function scanVideo(videoUrl: string): Promise<TScanResult> {
	// 1. Autentikasi
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return { success: false, message: "Unauthorized" };
	}

	// 2. Kirim ke ML backend (FastAPI)
	let mlData: TMLResponse;
	try {
		const mlResponse = await fetch(`${process.env.BACKEND_ML_URL}/predict`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ video_url: videoUrl }),
		});

		if (!mlResponse.ok) {
			return { success: false, message: "Gagal memproses video di ML backend" };
		}

		mlData = await mlResponse.json();
	} catch {
		return { success: false, message: "ML backend tidak dapat dijangkau" };
	}

	// 3. Simpan setiap komentar ke MongoDB
	try {
		await connectDB();

		const userId = new mongoose.Types.ObjectId(session.user.id);
		const waktuDiproses = new Date();

		const dokumen = mlData.hasil_analisis_ml
			.filter((komentar) => komentar.teks_komentar.trim() !== "")
			.map((komentar) => ({
				user_id: userId,
				video_metadata: {
					video_id: mlData.video_id,
					video_url: mlData.video_url,
					judul_video: mlData.judul_video,
				},
				data_komentar: {
					komentar_id: komentar.komentar_id,
					username_pengirim: komentar.username_pengirim,
					teks_komentar: komentar.teks_komentar,
					timestamp_komentar: new Date(komentar.timestamp_komentar),
				},
				hasil_analisis_ml: {
					prediksi_svm_utama: komentar.prediksi_svm_utama,
					prediksi_nb_pembanding: komentar.prediksi_nb_pembanding,
				},
				status_tindakan: {
					tindakan_diambil: "Menunggu Review",
					timestamp_tindakan: waktuDiproses,
				},
				waktu_diproses: waktuDiproses,
			}));

		if (dokumen.length > 0) {
			await ModerationHistory.insertMany(dokumen, { ordered: false }).catch(
				(error) => {
					if (error.code !== 11000 && error.name !== "BulkWriteError") {
						throw error;
					}
				},
			);
		}
	} catch (error) {
		console.error(error);
		return { success: false, message: "Gagal menyimpan hasil ke database" };
	}

	return { success: true, data: mlData };
}
