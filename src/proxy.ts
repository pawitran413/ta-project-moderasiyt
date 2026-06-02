import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const proxy = async (request: NextRequest) => {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	const { pathname } = request.nextUrl;
	const isAuthPage =
		pathname.startsWith("/login") || pathname.startsWith("/register");
	const isRequireAuth =
		pathname.startsWith("/dashboard") || pathname.startsWith("/history");

	if (token && isAuthPage) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (!token && isRequireAuth) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
};

export const config = {
	// matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
	matcher: ["/dashboard/:path*", "/history/:path*", "/login", "/register"],
};
