import mongoose, { Document, Schema } from "mongoose";

// --- Sub-document interfaces ---

interface IVideoMetadata {
	video_id?: string;
	video_url: string;
	judul_video?: string;
}

interface IDataKomentar {
	komentar_id: string;
	username_pengirim: string;
	teks_komentar: string;
	timestamp_komentar: Date;
}

interface IPrediksiLabel {
	label: "Spam" | "Normal";
	confidence_score: number;
}

interface IHasilAnalisisMl {
	prediksi_svm_utama: IPrediksiLabel;
	prediksi_nb_pembanding?: IPrediksiLabel;
}

interface IStatusTindakan {
	tindakan_diambil: "Menunggu Review" | "Dihapus";
	timestamp_tindakan: Date;
	catatan_sistem?: string;
}

// --- Main document interface ---

export interface IModerationHistory {
	user_id: mongoose.Types.ObjectId;
	video_metadata: IVideoMetadata;
	data_komentar: IDataKomentar;
	hasil_analisis_ml: IHasilAnalisisMl;
	status_tindakan: IStatusTindakan;
	waktu_diproses: Date;
}

export interface IModerationHistoryDocument
	extends IModerationHistory, Document {}

// --- Schema ---

const PrediksiLabelSchema = new Schema<IPrediksiLabel>(
	{
		label: { type: String, enum: ["Spam", "Normal"], required: true },
		confidence_score: { type: Number, required: true },
	},
	{ _id: false },
);

const ModerationHistorySchema = new Schema<IModerationHistoryDocument>(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		video_metadata: {
			video_id: { type: String },
			video_url: { type: String, required: true },
			judul_video: { type: String },
		},
		data_komentar: {
			komentar_id: { type: String, required: true },
			username_pengirim: { type: String, required: true },
			teks_komentar: { type: String, required: true },
			timestamp_komentar: { type: Date, required: true },
		},
		hasil_analisis_ml: {
			prediksi_svm_utama: { type: PrediksiLabelSchema, required: true },
			prediksi_nb_pembanding: { type: PrediksiLabelSchema },
		},
		status_tindakan: {
			tindakan_diambil: {
				type: String,
				enum: ["Menunggu Review", "Dihapus"],
				default: "Menunggu Review",
			},
			timestamp_tindakan: { type: Date, default: Date.now },
			catatan_sistem: { type: String },
		},
		waktu_diproses: { type: Date, default: Date.now },
	},
	{ timestamps: false },
);

ModerationHistorySchema.index(
	{ user_id: 1, "data_komentar.komentar_id": 1 },
	{ unique: true },
);

const ModerationHistory =
	mongoose.models.ModerationHistory ||
	mongoose.model<IModerationHistoryDocument>(
		"ModerationHistory",
		ModerationHistorySchema,
	);

export default ModerationHistory;
