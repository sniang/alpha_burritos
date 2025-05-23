import React, { useState, useEffect } from "react";

const Parmeters = ({ selectedFile}) => {
    const [parameters, setParameters] = useState(null);
    const [error, setError] = useState(null);
    const locations = ["PDS", "BDS", "DSAT", "USAT"];

    function formatToFiveSignificantDigits(num) {
  return Number(num).toPrecision(5);
}

    useEffect(() => {
        const fetchParameters = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/json/${selectedFile}`);
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await res.json();
                setParameters(data);
            } catch (error) {
                setError(error);
            }
        };

        if (selectedFile) {
            console.log('Fetching:', selectedFile);
            fetchParameters();
            console.log('Parameters:', parameters);

        }
    }, [selectedFile]);

    if (error) {
        <div>
            <h2>Parameters</h2>
            <p className="error">Something went wrong while loading the parameters: {error.message}</p>
        </div>
    }

    
    if (parameters) {
    return (
        <div>
            <h2>Parameters</h2>
            {locations.map((location) => {
                return (
                    <div key={location}>
                        <h3>{location}:</h3>
                        <ul>
                            <li>area: {formatToFiveSignificantDigits(parameters[location].area)} [V.ns]</li>
                            <li>fwhm: {formatToFiveSignificantDigits(parameters[location].fwhm)} [ns]</li>
                            <li>peak: {formatToFiveSignificantDigits(parameters[location].peak)} [V]</li>
                            <li>rise: {formatToFiveSignificantDigits(formatToFiveSignificantDigits(parameters[location].rise))} [ns]</li>
                            <li>time peak: {formatToFiveSignificantDigits(parameters[location]["time peak"])} [ns]</li>
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}
};

export default Parmeters;