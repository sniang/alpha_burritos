import React from "react";
import { useState, useEffect } from "react";
import './CSS/ChooseConfig.css';

const ChooseConfig = () => {
    const [config, setConfig] = useState('positrons');
    const [fit, setFit] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    return (
      <div id="ChooseConfig" className="blocks">
        <strong>Choose configuration</strong>
        <button
          style={{ opacity: config !== 'positrons' ? 0.5 : 1 }}
          onClick={() => {setConfig('positrons'); alert("This doesn't work yet")}}
        >
          Positrons
        </button>
        <button
          style={{ opacity: config !== 'antiprotons' ? 0.5 : 1 }}
          onClick={() => {setConfig('antiprotons'); alert("This doesn't work yet");}}
        >
          Antiprotons
        </button>
        <button
          style={{ opacity: fit ? 1 : 0.5 }}
          onClick={() => {setFit(!fit); alert("This doesn't work yet");}}
        >
            {fit ? "Fit enabled" : "Fit disabled"}
        </button>
      </div>
    );
}

export default ChooseConfig;



