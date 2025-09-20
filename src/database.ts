import { Pool } from 'pg';
import {User} from "./types";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export const connectToDB = async (): Promise<void> => {
    try {
        const client = await pool.connect();
        console.log('DB connected ;))) ');
        client.release();
    } catch (error) {
        console.error('DB connection failed:', error);
        throw error;
    }
};

export const createUsersTable = async (): Promise<void> => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS public.users (
      "name" varchar NOT NULL,
      age int4 NOT NULL,
      address jsonb NULL,
      additional_info jsonb NULL,
      id serial4 NOT NULL,
      PRIMARY KEY (id)
    );
  `;
    await pool.query(createTableQuery);
};

export const insertUsers = async (users: Omit<User, 'id'>[]): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const insertQuery = `
            INSERT INTO public.users (name, age, address, additional_info)
            VALUES ($1, $2, $3, $4)
        `;

        for (const user of users) {
            const fullName = `${user.name.firstName} ${user.name.lastName}`;

            await client.query(insertQuery, [
                fullName,
                user.age,
                user.address ? JSON.stringify(user.address) : null,
                user.additional_info ? JSON.stringify(user.additional_info) : null
            ]);
        }

        await client.query('COMMIT');
        console.log(`Insert of ${users.length} users complete!`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error inserting users:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const getAgeDistribution = async () => {
    const query = `
        SELECT 
            COUNT(CASE WHEN age < 20 THEN 1 END) as under_20,
            COUNT(CASE WHEN age >= 20 AND age < 40 THEN 1 END) as age_20_to_40,
            COUNT(CASE WHEN age >= 40 AND age < 60 THEN 1 END) as age_40_to_60,
            COUNT(CASE WHEN age >= 60 THEN 1 END) as over_60,
            COUNT(*) as total
        FROM public.users;
    `;

    const result = await pool.query(query);
    const row = result.rows[0];

    if (parseInt(row.total) === 0) {
        return null;
    }

    const total = parseInt(row.total);
    const under20 = parseInt(row.under_20);
    const age20to40 = parseInt(row.age_20_to_40);
    const age40to60 = parseInt(row.age_40_to_60);
    const over60 = parseInt(row.over_60);

    const under20Pct = Math.round((under20 / total) * 100);
    const age20to40Pct = Math.round((age20to40 / total) * 100);
    const age40to60Pct = Math.round((age40to60 / total) * 100);
    const over60Pct = Math.round((over60 / total) * 100);

    const report = `
Age-Group    % Distribution
< 20         ${under20Pct}
20 to 40     ${age20to40Pct}
40 to 60     ${age40to60Pct}
> 60         ${over60Pct}`;

    console.log(report);

    return {
        under20: under20Pct,
        age20to40: age20to40Pct,
        age40to60: age40to60Pct,
        over60: over60Pct,
        total: total,
    };
};

export const clearUsers = async (): Promise<void> => {
    await pool.query('DELETE FROM public.users');
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    console.log('DB Cleared!');
};

export const initializeDatabase = async (): Promise<void> => {
    await connectToDB();
    await createUsersTable();
};

export default pool;