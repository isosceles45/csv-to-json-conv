import 'dotenv/config';
import app from "./src/app.js";
import {initializeDatabase} from "./src/database.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await initializeDatabase();
    console.log(`Server is running on port ${PORT}`);
});