const DashboardPage = () => {
	return (
		<div>
			<h1>Dashboard</h1>

			<form>
				<label htmlFor="urlVideo">URL Video YouTube</label>
				<input type="text" name="urlVideo" id="urlVideo" />

				<button type="submit">Mulai Scan</button>
			</form>
		</div>
	);
};

export default DashboardPage;
