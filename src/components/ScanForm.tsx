interface ScanFormProps {
	isScanLoading: boolean;
	onSubmit: (event: React.SubmitEvent) => Promise<void>;
}

const ScanForm = ({ isScanLoading, onSubmit }: ScanFormProps) => {
	return (
		<form
			className="flex flex-col gap-3 w-full max-w-100 border border-white/15 p-5 rounded-lg"
			onSubmit={onSubmit}
		>
			<div className="flex flex-col gap-1.5">
				<label htmlFor="urlVideo" className="text-sm text-center text-white/70">
					URL Video YouTube
				</label>
				<input
					type="url"
					name="urlVideo"
					id="urlVideo"
					pattern="https:\/\/(www\.)?(youtube\.com|youtu\.be).*"
					placeholder="https://www.youtube.com/watch?v=tGv7CUutzqU"
					className="py-1.5 px-4 rounded-full border border-white/15 bg-transparent placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
					required
				/>
			</div>

			<button
				type="submit"
				disabled={isScanLoading}
				className="p-1.5 bg-white text-black rounded-full cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
			>
				{isScanLoading ? "Memproses..." : "Scan"}
			</button>
		</form>
	);
};

export default ScanForm;
