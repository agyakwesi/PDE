import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 5001;
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ["https://parfumdelite.tech", "https://www.parfumdelite.tech", "https://pafum-d-elite.vercel.app", "http://localhost:5173"], // Allow deployed domains and local dev
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // If you are using cookies/sessions
}));


try {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer' // Important for images
    });

    const contentType = response.headers['content-type'];
    res.set('Content-Type', contentType);
    res.send(response.data);
} catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(500).send('Error fetching image');
}
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
