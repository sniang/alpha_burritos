const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
        <p className="error">Something went wrong: {error.message}</p>
    );
}

export default ErrorMessage;