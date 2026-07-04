import Navbar from "@/components/Navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col gap-5 my-7">
			<Navbar />
			{children}
		</div>
	);
};

export default MainLayout;
