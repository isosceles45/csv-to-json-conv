import express from 'express';
import fs from 'fs';
import { parseCsv } from "./csvParser.js";

const app = express();

app.use(express.json());

app.get('/test-csv', async (req, res) => {
    try {
        const csvPath = process.env.CSV_FILE_PATH || './data/sample.csv';

        if (!fs.existsSync(csvPath)) {
            return res.status(404).json({
                error: 'CSV file not found',
                path: csvPath
            });
        }

        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const users = parseCsv(csvContent);

        res.json({
            message: 'CSV parsed successfully',
            totalUsers: users.length,
            users: users
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to parse CSV',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default app;