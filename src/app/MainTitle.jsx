import alphaLogo from '../assets/ALPHA_Logo_png.png';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
/**
 * Renders the main title component of the ALPHA Burritos application.
 * Displays the ALPHA experiment logo alongside the text "ALPHA Burritos Detectors".
 * 
 * @component
 * @author Samuel Niang
 * @returns {JSX.Element} A heading element containing the logo and title text
 * @param {Function} props.handleLogout - Callback invoked when the user clicks "Log out"
 */
const MainTitle = ({ handleLogout }) => {
    return (
        <Typography variant="h4" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px', textAlign: 'center' }}>
            <img style={{ width: '55px', marginRight: '20px' }} src={alphaLogo} alt="Logo of the ALPHA experiment" />
            ALPHA Burrito Detectors
            {/* Logout button */}
            <Button sx={{ ml: '20px' }} onClick={handleLogout} startIcon={<LogoutIcon />} variant="contained">Log out</Button>
        </Typography>
    );
}
export default MainTitle;