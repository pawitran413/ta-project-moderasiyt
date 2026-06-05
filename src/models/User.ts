import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";

export interface IUser {
	name: string;
	email: string;
	password?: string;
	googleId?: string;
	youtubeChannelId?: string | null;
	botVerified: boolean;
	provider: "credentials" | "google";
	emailVerified: Date | null;
}

export interface IUserDocument extends IUser, Document {
	createdAt?: Date;
	updatedAt?: Date;
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
		youtubeChannelId: {
			type: String,
			// default: null,
			unique: true,
			sparse: true,
		},
		botVerified: { type: Boolean, default: false },
		provider: {
			type: String,
			enum: ["credentials", "google"],
			required: true,
		},
		emailVerified: { type: Date, default: null },
	},
	{ timestamps: true },
);

UserSchema.pre("save", async function (this: IUserDocument) {
	if (!this.isModified("password") || !this.password) return;
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	} catch (error) {
		throw error;
	}
});

const User =
	mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
