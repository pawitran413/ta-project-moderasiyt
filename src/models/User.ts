import bcrypt from "bcryptjs";
import mongoose, { Document, Model } from "mongoose";
import crypto from "crypto";

export interface IUser {
	name: string;
	email: string;
	password?: string;
	googleId?: string;
	youtubeChannelId: string | null;
	botVerified: boolean;
	provider: "credentials" | "google";
	emailVerified: Date | null;
	emailVerificationToken?: string | null;
	emailVerificationExpires?: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
	generateEmailVerificationToken(): string;
}

const UserSchema = new mongoose.Schema<IUserDocument>(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			select: false,
			required: function (this: IUserDocument) {
				return this.provider === "credentials";
			},
		},
		googleId: { type: String, unique: true, sparse: true },
		youtubeChannelId: { type: String, default: null },
		botVerified: { type: Boolean, default: false },
		provider: {
			type: String,
			enum: ["credentials", "google"],
			required: true,
		},
		emailVerified: { type: Date, default: null },
		emailVerificationToken: { type: String, select: false },
		emailVerificationExpires: { type: Date, select: false },
	},
	{ timestamps: true },
);

UserSchema.methods.generateEmailVerificationToken = function (
	this: IUserDocument,
) {
	const token = crypto.randomBytes(32).toString("hex");

	this.emailVerificationToken = crypto
		.createHash("sha256")
		.update(token)
		.digest("hex");

	this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

	return token;
};

UserSchema.pre("save", async function (this: IUserDocument) {
	if (!this.isModified("password") || !this.password) return;
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	} catch (error) {
		throw error;
	}
});

const User: Model<IUserDocument> =
	mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
