# CSV to JSON Converter API

Node.js application that converts CSV files to JSON and stores data in PostgreSQL with age distribution analysis. I have created multiple APIs all of them are listed below,
The main API endpoint (/process-csv) for processing the csv sending a JSON back this endpoint also stores into the USERS table in the db and logs the age distribution.
Some helper APIs tend do this individually for different use case, theres also the delete-users endpoint created for testing purpose.
I have tried to keep the project code quality production level with considerable error handling and readable code.

## Setup

1. Install dependencies
```bash
npm install
```

2. Setup environment variables then update with yours
```bash
cp .env.example .env
```

3. Start the application
```bash
npm run dev
```

## API Endpoints

Process CSV file and insert into database. Automatically prints age distribution to console.
```bash
# Process CSV only
curl -X POST http://localhost:3000/process-csv

# Process CSV and return data
curl -X POST "http://localhost:3000/process-csv?returnData=true"
```

Get all users from database.
```bash
curl http://localhost:3000/view-users
```

Get age distribution statistics.
```bash
curl http://localhost:3000/age-report
```

Delete all users and reset ID sequence.
```bash
curl -X DELETE http://localhost:3000/delete-users
```

## Environment Variables (Refer .env.example)

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=your_db
CSV_FILE_PATH=./data/sample.csv
PORT=3000
```

## CSV Format (Sample inside ./data folder)

```csv
name.firstName,name.lastName,age,address.line1,address.city,address.state,gender,phone.mobile
Rohit,Prasad,35,A-563 Society,Pune,Maharashtra,male,9876543210
```

## Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL
- Custom CSV parser (not used any external libraries)
