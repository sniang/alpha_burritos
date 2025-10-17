/**
 * Comment Component
 * Displays and manages comments for a selected file.
 * 
 * @author Samuel Niang
 * @param {Object} props - Component props
 * @param {string} props.selectedFile - The path of the currently selected file
 */
import { useState, useEffect } from "react";
import './CSS/Comment.css';
import { Button } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import CancelIcon from '@mui/icons-material/Cancel';

const Comment = ({ selectedFile }) => {
    // State for existing comment, new comment input, edit mode, and error handling
    const [comment, setComment] = useState("No comment"); // Stores the current comment for the selected file
    const [newComment, setNewComment] = useState(""); // Stores the comment being edited
    const [update, setUpdate] = useState(false); // Controls whether edit mode is active
    const [error, setError] = useState(null); // Tracks any API or processing errors

    const fetchComment = async () => {
        try {
            // Fetch the existing comment for the selected file from the API
            const response = await fetch(`/api/comments/${selectedFile}`);
            if (!response.ok) {
                throw new Error('Failed to fetch comment');
            }
            const data = await response.json();
            // Update the comment state with the fetched data
            setComment(data.comment || "No comment");
            setNewComment(data.comment || "");
        } catch (err) {
            // Handle and display any errors during API call
            setError(err);
        }
    }

    // Fetch the comment when the component mounts or when selectedFile changes
    useEffect(() => {
        if (selectedFile) {
            fetchComment();
        }
    }, [selectedFile]);

    /**
     * Handles saving or toggling the comment edit mode
     * Makes API request to save the new comment when in edit mode
     * Toggles between view and edit mode
     */
    const updateComment = async () => {
        setError(null); // Reset any previous errors
        if (update && newComment !== comment) {
            // Save the new comment via API call when in edit mode and comment is not empty
            try {
                // POST request to save the comment for the selected file
                const response = await fetch(`/api/comments/${selectedFile}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ comment: newComment })
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error('Failed to save comment');
                }
                // Reset states after successful save
                if (newComment !== "") {
                    setComment(newComment);
                } else {
                    setComment("No comment");
                }
                return setUpdate(!update); // Exit edit mode
            } catch (err) {
                // Handle and display any errors during API call
                setError(err);
                return;
            }
        }
        // Toggle edit mode when not saving or when comment is empty
        setUpdate(!update);
    }

    return (
        <div id="comment-block" className="blocks">
            <h2>Comments</h2>
            {/* Display the current comment when not in edit mode */}
            {!update && <p style={{ whiteSpace: 'pre-wrap' }}>{comment}</p>}
            {/* Render textarea only when in edit mode */}
            {update &&
                <textarea
                    id="comment-textarea"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={"Write your comments here..."}
                />
            }
            <div id="comment-buttons-block">
                {/* Cancel button only appears in edit mode */}
                {update && <Button startIcon={<CancelIcon />} size="small" color="error" variant="contained" onClick={() => setUpdate(!update)}>Cancel</Button>}
                {/* Button text changes based on edit mode */}
                <Button startIcon={<EditNoteIcon />} size="small" color="success" variant="contained" onClick={updateComment}>{!update ? "Update comments" : "Save comments"}</Button>
            </div>

            {/* Error message display when applicable */}
            {error && <p>Error: {error.message}</p>}
        </div>
    );
}

export default Comment;