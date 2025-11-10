# Repertoire Search Application

A simple application to search for people who know specific musical pieces.

## Features
- Search for people who know a specific piece by title
- Copy search results to clipboard
- Admin endpoints to manage people, pieces, and their relationships
- Import data from Excel files

## Tech Stack
- Frontend: HTML + CSS + Vanilla JavaScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Excel processing: SheetJS (xlsx package)

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Set up PostgreSQL database:
   - Create a PostgreSQL database
   - Set the DATABASE_URL environment variable
   - Run the database initialization script:
     ```
     node init-db.js
     ```

   Or manually run the schema:
   ```sql
   CREATE TABLE people (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL UNIQUE
   );

   CREATE TABLE pieces (
     id SERIAL PRIMARY KEY,
     title TEXT NOT NULL UNIQUE
   );

   CREATE TABLE knows (
     person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
     piece_id INTEGER REFERENCES pieces(id) ON DELETE CASCADE,
     PRIMARY KEY (person_id, piece_id)
   );
   ```

3. Start the application:
   ```
   npm start
   ```

## API Endpoints

- `GET /api/search?piece=<title>&count=<number>` - Search for people who know a piece
- `POST /api/people` - Add a person (admin only)
- `POST /api/pieces` - Add a piece (admin only)
- `POST /api/knows` - Link a person to a piece (admin only)

## Data Import

### Excel Import

To import data from an Excel file:

1. Prepare your Excel file with columns "Name" and "PieceTitle"
2. Save the file (e.g., as data.xlsx)
3. Run the import script:
   ```
   node import.js <path-to-excel-file>
   ```
   
   Or use the npm script:
   ```
   npm run import <path-to-excel-file>
   ```

### JSON Import

To import data from a JSON file:

1. Prepare your JSON file with the correct structure (see cleaned_repertoire.json for example)
2. Run the import script:
   ```
   npm run import-json
   ```

### Managing Repertoire Data

You can also use the Python script to manage repertoire data:

1. Edit cleaned_repertoire.json directly or use manage_repertoire.py
2. Run the Python script to clean and validate data:
   ```
   python manage_repertoire.py
   ```
3. Test the JSON structure:
   ```
   npm run test-json
   ```
4. Import the data into the database:
   ```
   npm run import-json
   ```

## Deployment

To deploy on Render:
1. Create a new web service
2. Connect your repository
3. Set the build command to `npm install`
4. Set the start command to `npm start`
5. Add the DATABASE_URL environment variable from your PostgreSQL instance