import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

/**
 * A component that renders year, month, and day selector dropdowns.
 * 
 * @component
 * @author Samuel Niang
 * 
 * @param {Object} props - The component props
 * @param {number} props.year - The currently selected year
 * @param {function} props.setYear - Function to update the selected year
 * @param {number} props.month - The currently selected month (1-12)
 * @param {function} props.setMonth - Function to update the selected month
 * @param {number} props.day - The currently selected day (1-31)
 * @param {function} props.setDay - Function to update the selected day
 * 
 * @returns {JSX.Element} A div containing three select dropdowns for year, month, and day selection
 */
const DateSelector = ({ year, setYear, month, setMonth, day, setDay }) => {
    // Start year for the dropdown options
    const startYear = 2025;

    // Get current year for the year dropdown's range
    const currentYear = new Date().getFullYear();


    // Handler for year selection changes
    const handleYearChange = (e) => {
        setYear(Number(e.target.value));
    };

    // Handler for month selection changes
    const handleMonthChange = (e) => {
        setMonth(Number(e.target.value));
    };


    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Year selector */}
            <FormControl size="small" color="success" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: 13 }}>Year</InputLabel>
                <Select sx={{ fontSize: 13 }} value={year} onChange={handleYearChange} label="Year">
                    {Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i).map((y) => (
                        <MenuItem sx={{ fontSize: 13 }} key={y} value={y}>{y}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Month selector */}
            <FormControl size="small" color="success" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: 13 }}>Month</InputLabel>
                <Select sx={{ fontSize: 13 }} value={month} onChange={handleMonthChange} label="Month">
                    {getAllMonthsOfYear(year).map((date) => (
                        <MenuItem sx={{ fontSize: 13 }} key={`${year}-${date}`} value={date}>
                            {date}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Day selector */}
            <FormControl size="small" color="success" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: 13 }}>Day</InputLabel>
                <Select sx={{ fontSize: 13 }} value={day} onChange={(e) => setDay(Number(e.target.value))} label="Day">
                    {getAllDaysOfMonth(year, month).map((d) => (
                        <MenuItem sx={{ fontSize: 13 }} key={d.getDate()} value={d.getDate()}>
                            {d.getDate()}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};



export default DateSelector;

/**
 * Returns an array of Date objects representing each day of the specified month and year,
 * up to but not including today. The month parameter is 1-based (1 = January, 12 = December).
 *
 * @param {number} year - The full year (e.g., 2024).
 * @param {number} month - The month of the year (1-based, 1 = January, 12 = December).
 * @returns {Date[]} An array of Date objects for each day in the specified month, up to today.
 */
function getAllDaysOfMonth(year, month) {
    month = month - 1; // Convert to 0-based index for Date object
    const days = [];
    const date = new Date(year, month, 1); // month is 0-based: 0 = Jan, 11 = Dec
    const today = new Date();
    while (date.getMonth() === month && date < today) {
        // Clone the date to avoid mutation
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

/**
 * Returns an array of month numbers (1-12) for the specified year, up to the current month if the year is the current year,
 * or all 12 months if the year is in the past.
 *
 * @param {number} year - The year for which to retrieve the months.
 * @returns {number[]} An array of month numbers (1 for January, 12 for December) up to the current month if the year is the current year.
 */
function getAllMonthsOfYear(year) {
    const months = [];
    const today = new Date();
    const currentMonth = today.getFullYear() === year ? today.getMonth() : 11;
    for (let month = 0; month <= currentMonth; month++) {
        months.push(new Date(year, month, 1).getMonth() + 1); // First day of the month
    }
    return months;
}