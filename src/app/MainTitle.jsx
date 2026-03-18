import alphaLogo from '../assets/ALPHA_Logo_png.png';
import Typography from '@mui/material/Typography';

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
        <Typography variant="h4" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px', textAlign: 'center' }}>
            <img style={{ width: '55px', marginRight: '20px' }} src={alphaLogo} alt="Logo of the ALPHA experiment" />
            ALPHA Burrito Detectors
        </Typography>
    );
}
export default MainTitle;