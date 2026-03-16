import DownloadButton from "./DownloadButton";
import Paper from '@mui/material/Paper';
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
const DetectorImage = ({ selectedFile, selectedDetector, fileVersion }) => {
    // Use fileVersion as cache buster and key
    const imgSrc = `/api/img/${selectedDetector}/${selectedFile.replace('.json', '.png').replace('data', selectedDetector)}?v=${fileVersion}`;

    return (
    <Paper sx={{ flex: 1,  padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: "2px" }}>
        <Typography variant="h6" >{`Detector: ${selectedDetector}`}</Typography>
            <img
                key={fileVersion}
                style={{ width: '100%', maxWidth: '500px' }}
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
            <DownloadButton
                selectedFile={selectedFile}
                selectedDetector={selectedDetector}
            />
        </Paper>
    );
};

export default DetectorImage;