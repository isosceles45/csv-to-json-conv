import { Pool } from 'pg';
import {User} from "./types";

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'kelp_challenge',
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

export const clearUsers = async (): Promise<void> => {
    await pool.query('DELETE FROM public.users');
    console.log('DB Cleared!');
};

export const initializeDatabase = async (): Promise<void> => {
    await connectToDB();
    await createUsersTable();
};

export default pool;