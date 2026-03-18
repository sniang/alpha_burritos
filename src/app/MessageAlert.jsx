import Snackbar from '@mui/material/Snackbar';

export default function MessageAlert({ message, open, setOpen }) {

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            open={open}
            autoHideDuration={5000}
            onClose={handleClose}
            message={message}
        />
    );
}