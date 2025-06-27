import React, { useState } from "react";

/**
 * A component that renders year and month selector dropdowns.
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
 * @returns {JSX.Element} A div containing two select dropdowns for year and month selection
 */
const DateSelector = ({ year, setYear, month, setMonth, day, setDay }) => {
    // Start year for the dropdown options
    const startYear = 2025;

    // Get current year for the year dropdown's range
    const currentYear = new Date().getFullYear();
    
    // Get current day for the day dropdown's range
    const currentDay = new Date().getDate();

    // Handler for year selection changes
    const handleYearChange = (e) => {
        setYear(Number(e.target.value));
    };

    // Handler for month selection changes
    const handleMonthChange = (e) => {
        setMonth(Number(e.target.value));
    };

    return (
        // Container with flex layout and styling
        <>
            {/* Year selector */}
            <label>
                Year:
                <select value={year} onChange={handleYearChange}>
                     {/* Generate year options from startYear to currentYear */}
                    {Array.from({ length: currentYear - startYear + 1}, (_, i) => currentYear + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </label>
            {/* Month selector */}
            <label>
                Month:
                <select value={month} onChange={handleMonthChange}>
                    {/* Generate months 1-12 as options */}
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1}
                        </option>
                    ))}
                </select>
            </label>
            {/* Day selector */}
            <label>
                Day:
                <select value={day} onChange={(e) => setDay(Number(e.target.value
                ))}>
                    {/* Generate days 1-today as options */}
                    {Array.from({ length: currentDay }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1}
                        </option>
                    ))}
                </select>
            </label>
        </>
    );
};

export default DateSelector;