/**
 * MessageAlert.jsx
 * Author: Samuel Niang
 *
 * This component displays a Material-UI Snackbar for alert messages.
 * It is designed to show temporary notifications at the top-left corner of the screen.
 *
 * Props:
 *   - message (string): The message to display in the alert.
 *   - open (boolean): Controls whether the Snackbar is visible.
 *   - setOpen (function): Function to update the open state.
 */

import Snackbar from '@mui/material/Snackbar';

/**
 * MessageAlert functional component
 * @param {Object} props - Component props
 * @param {string} props.message - The alert message to display
 * @param {boolean} props.open - Whether the Snackbar is open
 * @param {function} props.setOpen - Function to set the open state
 */
export default function MessageAlert({ message, open, setOpen }) {
    /**
     * Handles closing the Snackbar.
     * Ignores the event if the reason is 'clickaway'.
     * @param {object} event - The event source of the callback
     * @param {string} reason - The reason for closing
     */
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }} // Position the Snackbar at the top-left
            open={open} // Control visibility
            autoHideDuration={5000} // Auto-hide after 5 seconds
            onClose={handleClose} // Handle close event
            message={message} // Display the provided message
        />
    );
}