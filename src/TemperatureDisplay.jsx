import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const HOST_MAP = {
	'rp-f0a821.local': 'pitaya_1',
	'rp-f073bf.local': 'pitaya_2',
	'rp-f0bd54.local': 'pitaya_3',
	'rp-f0be22.local': 'pitaya_4',
	'rp-f0be4b.local': 'pitaya_5',
};

function TemperatureDisplay( {display = true} ) {
	const [data, setData] = useState({});
	const [timestamp, setTimestamp] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await fetch('/api/temperature');
			if (!res.ok) throw new Error('Failed to fetch');
			const json = await res.json();
			setData(json.hosts || {});
			setTimestamp(json.timestamp_utc || '');
		} catch (err) {
			setError('Error fetching temperature data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		const interval = setInterval(fetchData, 10000);
		return () => clearInterval(interval);
	}, []);

	       return display ? (
		       <TableContainer component={Paper} sx={{ maxWidth: 300, mt: 2, bgcolor: 'success.main', color: 'white', borderRadius: 2, boxShadow: 3 }}>
			       <Table sx={{ color: 'white' }}>
				       <TableHead>
					       <TableRow>
						       <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Host</TableCell>
						       <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Temperature (°C)</TableCell>
						       <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Error</TableCell>
					       </TableRow>
				       </TableHead>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={3}>Loading...</TableCell>
						</TableRow>
					) : error ? (
						<TableRow>
							<TableCell colSpan={3}>{error}</TableCell>
						</TableRow>
					) : (
						Object.entries(HOST_MAP).map(([host, name]) => (
							<TableRow key={host}>
								       <TableCell sx={{ color: 'white' }}>{name}</TableCell>
								       <TableCell align="right" sx={{ color: 'white' }}>
									       {data[host]?.temp_c !== undefined ? data[host].temp_c.toFixed(2) : 'N/A'}
								       </TableCell>
								       <TableCell align="right" sx={{ color: 'white' }}>
									       {data[host]?.error || ''}
								       </TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
			       <div style={{ padding: 8, fontSize: 12, color: 'white' }}>
				       {timestamp && `Last updated: ${timestamp}`}
			       </div>
		</TableContainer>
	) : null;
}

export default TemperatureDisplay;
