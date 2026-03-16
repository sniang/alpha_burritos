/**
 * @file TemperatureDisplay.jsx
 * @description Dialog component that displays real-time temperature readings
 *              from the Pitaya (Red Pitaya) boards. Polls the server every
 *              second and renders the data in a Material-UI table.
 * @author Samuel Niang
 */

import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';

/** Mapping from Red Pitaya hostnames to human-readable labels. */
const HOST_MAP = {
	'rp-f0a821.local': 'pitaya_1',
	'rp-f073bf.local': 'pitaya_2',
	'rp-f0bd54.local': 'pitaya_3',
	'rp-f0be22.local': 'pitaya_4',
	'rp-f0be4b.local': 'pitaya_5',
};

const TEMPERATURE_THRESHOLD = 50; // °C - threshold for highlighting high temperatures in red

/**
 * TemperatureDisplay – modal dialog showing live Pitaya temperatures.
 *
 * @param {Object}   props
 * @param {boolean}  props.display    - Whether the dialog is visible.
 * @param {Function} props.setDisplay - Callback to toggle dialog visibility.
 */
function TemperatureDisplay({ display, setDisplay }) {
	const [data, setData] = useState({});
	const [timestamp, setTimestamp] = useState('');
	const [error, setError] = useState(null);

	/**
	 * Fetches the latest temperature data from the backend API
	 * and updates the component state accordingly.
	 */
	const fetchData = async () => {
		try {
			setError(null);
			const res = await fetch('/api/temperature');
			if (!res.ok) throw new Error('Failed to fetch');
			const json = await res.json();
			setData(json.hosts || {});
			setTimestamp(json.timestamp_utc || '');
		} catch (err) {
			setError('Error fetching temperature data');
		}
	};

	// Poll the temperature endpoint every second while the component is mounted.
	useEffect(() => {
		fetchData();
		const interval = setInterval(fetchData, 1000);
		return () => clearInterval(interval);
	}, []);1

	return (data) ? (
		<>
		{/* Warning alerts rendered outside the dialog for hosts exceeding the temperature threshold. */}
		{Object.entries(HOST_MAP).map(([host, name]) => {
			if (!data[host]?.temp_c ) return null; // Skip hosts with no data
			if (data[host].temp_c > TEMPERATURE_THRESHOLD){
				return (
					<Alert severity="warning" key={host} sx={{ marginTop: '5px' }}>
						{`High temperature detected on ${name.replace('_', ' ')}`}
					</Alert>
				);
			}
		})}

		{/* Temperature details dialog */}
		<Dialog open={display} maxWidth="sm" fullWidth onClose={() => { setDisplay(false) }} sx={{ textAlign: 'center' }}>
			<DialogTitle>Temperatures of the Pitayas</DialogTitle>
			<TableContainer component={Paper} sx={{ width: '400px', mt: 2, borderRadius: 2, boxShadow: 3, margin: '0 auto' }}>
				<Table >
					<TableHead>
						<TableRow>
							<TableCell sx={{ fontWeight: 'bold' }}>Host</TableCell>
							<TableCell align="right" sx={{ fontWeight: 'bold' }}>Temperature (°C)</TableCell>
							<TableCell align="right" sx={{ fontWeight: 'bold' }}>Error</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{error ? (
							<TableRow>
								<TableCell colSpan={3}>{error}</TableCell>
							</TableRow>
						) : (
							/* Iterate over the known hosts and display their temperature or 'N/A'. */
							Object.entries(HOST_MAP).map(([host, name]) => (
								<TableRow key={host}>
									<TableCell >{name}</TableCell>
									<TableCell align="right" >
										{data[host]?.temp_c ? data[host].temp_c.toFixed(2) : 'N/A'}
									</TableCell>
									<TableCell align="right" >
										{data[host]?.error || ''}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
				{/* Display the UTC timestamp of the last successful data fetch. */}
				<div style={{ padding: 8, fontSize: 12 }}>
					{timestamp && `Last updated: ${timestamp}`}
				</div>
			</TableContainer>
			<br />
		</Dialog>
		</>
	) : null;
}

export default TemperatureDisplay;
