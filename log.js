function postLog(message) {
    try {
        fetch('/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        }).catch(err => console.error('Failed to send log to server', err));
    } catch (err) {}
};
