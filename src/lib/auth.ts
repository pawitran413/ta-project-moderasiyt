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
					prompt: "select_account",
				},
			},
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "credentials") return true;

			if (account?.provider === "google") {
				if (!user.email) return false;
				await connectDB();

				let youtubeChannelId: string | null = null;
				try {
					const ytRes = await fetch(
						"https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
						{
							headers: {
								Authorization: `Bearer ${account.access_token}`,
							},
						},
					);
					const ytData = await ytRes.json();
					youtubeChannelId = ytData.items?.[0]?.id ?? null;
				} catch {
					return "/error?error=YoutubeChannelFetchFailed";
				}

				if (!youtubeChannelId) {
					return "/error?error=NoYoutubeChannel";
				}

				const channelOccupied = await User.findOne({ youtubeChannelId });
				if (channelOccupied && channelOccupied.email !== user.email) {
					return "/error?error=ChannelAlreadyLinked";
				}

				const existingUser = await User.findOne({ email: user.email });
				if (existingUser) {
					existingUser.googleId = account.providerAccountId;
					existingUser.youtubeChannelId = youtubeChannelId;
					await existingUser.save();
					return true;
				}

				return "/error?error=AccountNotFound";
			}

			return true;
		},

		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id;
			}

			if (trigger === "update" && session?.youtubeChannelId !== undefined) {
				token.youtubeChannelId = session.youtubeChannelId;
				return token;
			}

			if (user && token.email) {
				await connectDB();
				const dbUser = await User.findOne({ email: token.email }).select(
					"_id youtubeChannelId",
				);
				token.id = dbUser?._id.toString();
				token.youtubeChannelId = dbUser?.youtubeChannelId ?? null;
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
