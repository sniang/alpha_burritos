import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography} from "@mui/material";


const ConfigTable = ({ showDetails, data, dataKeys }) => {
      // Extract configuration parameters (excluding "Mapping") for details display
    const params = dataKeys.filter((key) => key !== "Mapping").sort((a, b) => a.localeCompare(b));
    if (!showDetails) return null; // Don't render anything if details are not toggled
    return (
        <div style={{ display: 'flex', flexDirection: "column", alignItems: "center" }}>
            {params.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2, maxWidth: 700 }}>
                    <Table size="small">

                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography fontWeight={600}>Parameter</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight={600}>Value</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight={600}>Parameter</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight={600}>Value</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {Array.from({ length: Math.ceil(params.length / 2) }).map((_, i) => {
                                const p1 = params[i * 2];
                                const p2 = params[i * 2 + 1];

                                return (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <Typography variant="body2">{p1}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {data[p1]?.toString()}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{p2 || ""}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {p2 ? data[p2]?.toString() : ""}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                    </Table>
                </TableContainer>
            )}

            {/* Display Mapping details if available */}
            {data.Mapping && (
                <TableContainer component={Paper} sx={{ mt: 2, maxWidth: 500 }}>
                    <Table size="small">

                        <TableHead>
                            {/* Table title */}
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Mapping
                                    </Typography>
                                </TableCell>
                            </TableRow>

                            {/* Column headers */}
                            <TableRow>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                        Red Pitaya
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                        Channel 1
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                        Channel 2
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {Object.entries(data.Mapping).map(([key, channels], index) => {

                                const ch1 = channels.find(c => c[0].includes("ch1"))?.[1] || "-";
                                const ch2 = channels.find(c => c[0].includes("ch2"))?.[1] || "-";

                                return (
                                    <TableRow key={key}>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {index + 1}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {ch1}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {ch2}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                    </Table>
                </TableContainer>
            )}
        </div>);
}
export default ConfigTable;
