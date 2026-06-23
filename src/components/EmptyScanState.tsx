const EmptyScanState = () => {
	return (
		<div className="w-full max-w-100 flex flex-col items-center gap-2 border border-dashed border-white/15 rounded-lg px-6 py-10 text-center">
			<p className="text-white/70">Belum ada video yang dipindai</p>
			<p className="text-sm text-white/40">
				Tempel URL video YouTube di atas untuk mulai memeriksa komentar
			</p>
		</div>
	);
};

export default EmptyScanState;
