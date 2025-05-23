import React, {useState} from "react";

const DetectorImage = ({selectedFile, selectedDetector}) => {
    return (
        <div>
            <img
                src={`http://localhost:3001/api/img/${selectedDetector}/${selectedFile}`}
                alt={`Preview for ${selectedFile} with ${selectedDetector}`}
                style={{ width: "400px", height: "auto" }}
            />
        </div>
    );
};

export default DetectorImage;