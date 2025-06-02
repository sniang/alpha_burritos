/**
 * Comment Component
 * Displays and manages comments for a selected file.
 * 
 * @author Samuel Niang
 * @param {Object} props - Component props
 * @param {string} props.selectedFile - The path of the currently selected file
 */
import React, { useState, useEffect } from "react";
import './CSS/Comment.css';

const Comment = ({ selectedFile }) => {
    // State for existing comment, new comment input, edit mode, and error handling
    const [comment, setComment] = useState("No comment"); // Stores the current comment for the selected file
    const [newComment, setNewComment] = useState(""); // Stores the comment being edited
    const [update, setUpdate] = useState(false); // Controls whether edit mode is active
    const [error, setError] = useState(null); // Tracks any API or processing errors

    /**
     * Handles saving or toggling the comment edit mode
     * Makes API request to save the new comment when in edit mode
     * Toggles between view and edit mode
     */
    const updateComment = async () => {
        setError(null); // Reset any previous errors
        if (update && newComment !== "") {
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
                // Reset states after successful save
                setComment("No comment");
                setNewComment("");
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
        <div id="comment-block">
            <h2>Comments</h2>
            {/* Display the current comment when not in edit mode */}
            <p>{comment}</p>
            {/* Render textarea only when in edit mode */}
            {update &&
                <textarea
                    id="comment-textarea"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comments here..."
                />
            }
            <div id="comment-buttons-block">
                {/* Button text changes based on edit mode */}
                <button onClick={updateComment}>{!update ? "Update comments" : "Save comments"}</button>
                {/* Cancel button only appears in edit mode */}
                {update && <button onClick={() => setUpdate(!update)}>Cancel</button>}
            </div>

            {/* Error message display when applicable */}
            {error && <p>Something went wrong: {error.message}</p>}
        </div>
    );
}

export default Comment;