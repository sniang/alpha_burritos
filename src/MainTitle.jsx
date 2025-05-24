import React from "react";
import alphaLogo from './assets/ALPHA_Logo_png.png';
import './CSS/MainTitle.css';

/**
 * Renders the main title component of the ALPHA Burritos application.
 * Displays the ALPHA experiment logo alongside the text "ALPHA Burritos Detectors".
 * 
 * @component
 * @author Samuel Niang
 * @returns {JSX.Element} A heading element containing the logo and title text
 */
const MainTitle = () => {
    return (
            
            <h1 id="mainTitle"><img id="alphaLogo" src={alphaLogo} alt="Logo of the ALPHA experiment" />ALPHA Burritos Detectors</h1>
    );
}
export default MainTitle;