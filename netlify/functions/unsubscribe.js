const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { email } = JSON.parse(event.body);

        if (!email) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing email' }) };
        }

        const unsubscribedListPath = path.join('/tmp', 'unsubscribed.json'); // Netlify's temporary storage

        let unsubscribedList = [];
        if (fs.existsSync(unsubscribedListPath)) {
            unsubscribedList = JSON.parse(fs.readFileSync(unsubscribedListPath, 'utf-8'));
        }

        if (!unsubscribedList.includes(email)) {
            unsubscribedList.push(email);
            fs.writeFileSync(unsubscribedListPath, JSON.stringify(unsubscribedList, null, 2));
        }

        return { statusCode: 200, body: JSON.stringify({ message: 'You have been unsubscribed.' }) };
    } catch (error) {
        console.error('Error handling unsubscribe:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
    }
};