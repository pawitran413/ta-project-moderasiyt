import Badge from "./Badge";

interface ChannelStatusProps {
	userName: string;
	isLinked: boolean;
}

const ChannelStatus = ({ userName, isLinked }: ChannelStatusProps) => {
	return (
		<div className="w-full max-w-100 flex items-center justify-between border border-white/15 rounded-lg px-5 py-3">
			<p className="text-sm text-white/70">
				Masuk sebagai <span className="text-white">{userName}</span>
			</p>
			{isLinked ? (
				<Badge variant="success">Channel terhubung</Badge>
			) : (
				<Badge variant="neutral">Belum ditautkan</Badge>
			)}
		</div>
	);
};

export default ChannelStatus;
