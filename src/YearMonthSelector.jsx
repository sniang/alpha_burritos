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
 * 
 * @returns {JSX.Element} A div containing two select dropdowns for year and month selection
 */
const YearMonthSelector = ({ year, setYear, month, setMonth }) => {
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
        // Container with flex layout and styling
        <>
            {/* Year selector */}
            <label>
                Year:
                <select value={year} onChange={handleYearChange}>
                    {/* Generate last 10 years as options */}
                    {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
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
        </>
    );
};

export default YearMonthSelector;