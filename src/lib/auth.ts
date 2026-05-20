import User from "@/models/User";
import connectDB from "./mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions, DefaultSession } from "next-auth";
import bcrypt from "bcryptjs";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
		} & DefaultSession["user"];
	}
}

export const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},

			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email dan password wajib diisi");
				}

				await connectDB();

				const user = await User.findOne({
					email: credentials.email.toLowerCase(),
				}).select("+password");

				if (!user || !user.password) {
					throw new Error("Email atau password salah");
				}

				const isPasswordValid = await bcrypt.compare(
					credentials.password,
					user.password,
				);

				if (!isPasswordValid) {
					throw new Error("Email atau password salah");
				}

				if (!user.emailVerified) {
					throw new Error("Verifikasi email anda terlebih dahulu");
				}

				return {
					id: user._id.toString(),
					email: user.email,
					name: user.name,
				};
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				if (!user.email) return false;

				await connectDB();
				const existingUser = await User.findOne({ email: user.email });

				if (existingUser) {
					if (!existingUser.emailVerified) {
						throw new Error("Email telah terdaftar, verifikasi email anda");
					}

					if (!existingUser.googleId) {
						existingUser.googleId = account?.providerAccountId;
						await existingUser.save();
					}

					return true;
				}

				try {
					await User.create({
						name: user.name || "",
						email: user.email,
						googleId: account.providerAccountId,
						provider: "google",
						emailVerified: new Date(),
						youtubeChannelId: null,
						botVerified: false,
					});

					return true;
				} catch (error) {
					console.error("Gagal membuat user baru via google", error);
					return false;
				}
			}

			return true;
		},

		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = String(token.id);
			}

			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};
