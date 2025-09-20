import express from 'express';
import fs from 'fs';
import { parseCsv } from "./csvParser.js";
import pool, {clearUsers, getAgeDistribution, insertUsers} from "./database.js";

const app = express();

app.use(express.json());

app.post('/process-csv', async (req, res) => {
    try {
        const csvPath = process.env.CSV_FILE_PATH || './data/sample.csv';
        const returnData = req.query.returnData === 'true';

        if (!fs.existsSync(csvPath)) {
            return res.status(404).json({
                error: 'CSV file not found',
                path: csvPath
            });
        }

        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const users = parseCsv(csvContent);

        await insertUsers(users);

        await getAgeDistribution();

        if (returnData) {
            res.json({
                message: 'CSV processed and data inserted successfully',
                totalUsers: users.length,
                users: users
            });
        } else {
            res.json({
                message: 'CSV processed and data inserted successfully',
                totalUsers: users.length
            });
        }

    } catch (error) {
        res.status(500).json({
            error: 'Failed to process CSV',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/view-users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id');
        res.json({
            totalUsers: result.rows.length,
            users: result.rows
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/age-report', async (req, res) => {
    try {
        const ageStats = await getAgeDistribution();

        if (!ageStats) {
            return res.json({
                message: 'No users in DB'
            });
        }

        res.json({
            message: 'Age distribution results from DB',
            distribution: ageStats
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to calculate age distribution',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.delete('/delete-users', async (req, res) => {
    try {
        await clearUsers();
        res.json({
            message: 'All users deleted'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete users',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

export default app;