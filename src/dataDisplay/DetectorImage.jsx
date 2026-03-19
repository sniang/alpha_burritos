import DownloadButton from "./DownloadButton";
import Typography from '@mui/material/Typography';

/**
 * DetectorImage component displays an image processed by a selected detector.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.selectedFile - Name of the image file to display.
 * @param {string} props.selectedDetector - Detector type used to process the image.
 * @param {number|string} props.fileVersion - Version or cache buster for the image.
 * @returns {JSX.Element} A container with the processed image and a download button.
 *
 * @example
 * <DetectorImage
 *   selectedFile="example.jpg"
 *   selectedDetector="PDS"
 *   fileVersion={1}
 * />
 */
import { TextField } from "@mui/material";

const DetectorImage = ({ selectedFile, selectedDetector, fileVersion }) => {
    // Use fileVersion as cache buster and key
    const imgSrc = `/api/img/${selectedDetector}/${selectedFile.replace('.json', '.png').replace('data', selectedDetector)}?v=${fileVersion}`;

    // Generate share link
    let shareLink = "";
    if (selectedFile) {
      const url = new URL(window.location.href);
      url.searchParams.set("id", selectedFile);
      shareLink = url.toString();
    }

    return (
    <div style={{ flex: 1,  padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: "8px" }}>
        <Typography variant="h6" >{`Detector: ${selectedDetector}`}</Typography>
        <img
            key={fileVersion}
            style={{ width: '100%', maxWidth: '450px' }}
            src={imgSrc}
            alt={`Preview for ${selectedFile.replace('.json', '.png')} with ${selectedDetector}`}
            loading="eager"
            crossOrigin="anonymous"
            ref={img => {
                if (img) {
                    img.setAttribute("referrerPolicy", "no-referrer");
                }
            }}
        />
        <TextField
          label="Share Link"
          value={shareLink}
          size="small"
          style={{ minWidth: 300, marginBottom: 4 }}
        />
        <DownloadButton
            selectedFile={selectedFile}
            selectedDetector={selectedDetector}
        />
    </div>
    );
};

export default DetectorImage;