/**
 * MessageAlert.jsx
 * Author: Samuel Niang
 *
 * Displays a Material-UI Snackbar for alert messages.
 * Shows temporary notifications at the top-left corner of the screen.
 *
 * Props:
 *   - message (string): The message to display in the alert.
 */

import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';

/**
 * MessageAlert functional component
 * @param {Object} props - Component props
 * @param {string} props.message - The alert message to display
 * @param {Function} props.setMessage - Function to update the alert message
 */
export default function MessageAlert({ message, setMessage }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (message) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [message, setMessage]);

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
        setTimeout(() => {
            setMessage(null);
        }, 500); // Delay clearing the message by 0.5 second
    };

    return (
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }} // Snackbar position
            open={open} // Snackbar visibility
            autoHideDuration={5000} // Auto-hide after 5 seconds
            onClose={handleClose} // Close handler
            message={message} // Message to display
            action={
                <CloseIcon
                    onClick={handleClose}
                    style={{ cursor: 'pointer' }}
                />
            }
        />
    );
}