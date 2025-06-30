import React from "react";
import { useState, useEffect } from "react";
import './CSS/ChooseConfiguration.css';
import positronConfig from './assets/default_config_positrons.json';
import antiprotonConfig from './assets/default_config_antiprotons.json';

const ChooseConfiguration = ({ selectedFile }) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dataKeys, setDataKeys] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/configuration');
        if (!response.ok) throw new Error('Error fetching configuration');
        const result = await response.json();
        if (!result || Object.keys(result).length === 0) {
          throw new Error('No configuration data available');
        }
        if (!result.config || (result.config !== 'positrons' && result.config !== 'antiprotons')) {
          throw new Error('Config has to be defined (positrons or antiprotons)');
        }
        setData(result);
        setDataKeys(Object.keys(result));
      } catch (err) {
        setError(err.message);
        setData(null);
        setDataKeys([]);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 500);
    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = async (newConfig = data.config, newFit = data.fit) => {
    setError(null);
    if (newConfig !== 'positrons' && newConfig !== 'antiprotons')
      throw new Error('Config has to be defined (positrons or antiprotons)');
    let newData = null
    if (newConfig === 'positrons') {
      newData = positronConfig;
    } else if (newConfig === 'antiprotons') {
      console.log('Antiprotons configuration selected');
      newData = antiprotonConfig;
    }
    newData.fit = newFit;
    try {
      fetch('/api/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })
    }
    catch (error) {
      setError('Error updating configuration: ' + error.message);
    }
  }

  const handleReAnalyse = async () => {
    setError(null);
    setShowDetails(false);
    try {
      const response = await fetch(`/api/reanalyse/${selectedFile}`)
      if (!response.ok) {
        throw new Error('Error re-analysing the file');
      }
      const result = await response.json();
    }
    catch (error) {
      setError(error.message);
    }
  }

  if (!data) return null;

  return (
    <div id="ChooseConfig" className="blocks">
      <h3>Choose configuration (not working yet)</h3>
      <div className="buttonBlock">
        <button
          className="green"
          style={{ opacity: data.config !== 'positrons' ? 0.5 : 1 }}
          onClick={() => handleConfigChange('positrons')}
        >
          Positrons
        </button>
        <button
          className="green"
          style={{ opacity: data.config !== 'antiprotons' ? 0.5 : 1 }}
          onClick={() => handleConfigChange('antiprotons')}
        >
          Antiprotons
        </button>
        <button
          className="green"
          style={{ opacity: data.fit ? 1 : 0.5 }}
          onClick={() => { handleConfigChange(data.config, !data.fit); }}
        >
          {data.fit ? "Fit enabled" : "Fit disabled"}
        </button>
        <button onClick={handleReAnalyse}>
          Re-analyse
        </button>
        <button
          onClick={() => { setShowDetails(!showDetails); }}
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>
      </div>
      {showDetails && (
        <div>
          <strong>Details of the configuration</strong>
          <ul>
            {dataKeys.map((key) => (
              <li key={key}>
                <strong>{key}:</strong> {JSON.stringify(data[key])}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}

export default ChooseConfiguration;



