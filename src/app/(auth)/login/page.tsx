"use client";

import { Suspense } from "react";
import LoginForm from "./LoginForm";

const LoginPage = () => {
	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	);
};

export default LoginPage;
