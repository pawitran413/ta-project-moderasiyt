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
			youtubeChannelId: string | null;
		} & DefaultSession["user"];
	}
}
declare module "next-auth/jwt" {
	interface JWT {
		id?: string;
		youtubeChannelId: string | null;
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
			authorization: {
				params: {
					scope:
						"openid email profile https://www.googleapis.com/auth/youtube.readonly",
				},
			},
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === "credentials") return true;

			// ⚠️ PERBAIKAN UTAMA: Mengubah fungsi OAuth menjadi alat penaut kepemilikan channel
			if (account?.provider === "google") {
				if (!user.email) return false;

				await connectDB();
				const incomingYoutubeChannelId = profile?.sub;

				// Guard Clause: Pastikan ID Channel ini tidak sedang dibajak atau dipakai akun lain
				const channelOccupied = await User.findOne({
					youtubeChannelId: incomingYoutubeChannelId,
				});
				if (channelOccupied && channelOccupied.email !== user.email) {
					throw new Error(
						"Channel YouTube ini sudah terhubung dengan akun lain!",
					);
				}

				const existingUser = await User.findOne({ email: user.email });

				if (existingUser) {
					// Update dan kunci kredensial dari jabat tangan Google resmi
					existingUser.googleId = account?.providerAccountId;
					existingUser.youtubeChannelId = incomingYoutubeChannelId;
					await existingUser.save();
					return true;
				}
			}

			return true;
		},

		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			if (token.email) {
				await connectDB();
				const dbUser = await User.findOne({ email: token.email });
				if (dbUser) {
					if (dbUser.youtubeChannelId) {
						token.youtubeChannelId = dbUser.youtubeChannelId;
					} else {
						token.youtubeChannelId = null;
					}
				}
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = String(token.id);
				session.user.youtubeChannelId = token.youtubeChannelId;
			}

			return session;
		},
	},
	pages: {
		signIn: "/login",
		error: "/error",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};
