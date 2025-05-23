import React, {useState} from "react";

const DetectorImageAll = ({selectedFile}) => {
  const imageUrl = `http://localhost:3001/api/img_all/${selectedFile}`;

  return (
    <div>
      <img
        src={imageUrl}
        alt={`Preview for ${selectedFile}`}
        style={{ width: "70%", height: "auto" }}
      />
    </div>
  );
}

export default DetectorImageAll;