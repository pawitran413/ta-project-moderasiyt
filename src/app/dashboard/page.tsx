import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

const DashboardPage = async () => {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/login");
	}

	return <DashboardClient session={session}></DashboardClient>;
};

export default DashboardPage;
