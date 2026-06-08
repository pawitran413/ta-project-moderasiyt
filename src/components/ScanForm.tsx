interface ScanFormProps {
	isScanLoading: boolean;
	onSubmit: (event: React.SubmitEvent) => Promise<void>;
}

const ScanForm = ({ isScanLoading, onSubmit }: ScanFormProps) => {
	return (
		<form
			className="flex flex-col gap-3 w-100 mx-auto border border-white/25 p-5 rounded-lg"
			onSubmit={onSubmit}
		>
			<div className="flex flex-col gap-1">
				<label htmlFor="urlVideo" className="px-4 text-center">
					URL Video YouTube
				</label>
				<input
					type="url"
					name="urlVideo"
					id="urlVideo"
					pattern="https:\/\/(www\.)?(youtube\.com|youtu\.be).*"
					placeholder="https://www.youtube.com/watch?v=tGv7CUutzqU"
					className="py-1.5 px-4 rounded-full border border-[#ccc]/25"
					required
				/>
			</div>

			<button
				type="submit"
				disabled={isScanLoading}
				className="p-1.5 bg-white text-black rounded-full cursor-pointer mt-3"
			>
				{isScanLoading ? "Memproses..." : "Scan"}
			</button>
		</form>
	);
};

export default ScanForm;
