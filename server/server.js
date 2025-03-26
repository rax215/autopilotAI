const express = require('express');
const cors = require('cors');
const { runCode } = require('./controller');
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

app.post('/run-code', async (req, res) => {
    try {
        const { code } = req.body;
        console.log('code:', code);
        
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        const result = await runCode(code);
        res.json(result);
    } catch (error) {
        console.error('Error running code:', error);
        res.status(500).json({ error: error.message || 'Failed to run code' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
