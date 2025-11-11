# Dombyra Ensemble Management System

This is a web application for managing the repertoire of a dombyra ensemble.

## Features

- Search for ensemble members who know specific pieces
- View complete repertoire by group
- Mobile-responsive design

## Deployment to Render

### Prerequisites

1. A Render account (https://render.com)
2. This repository

### Deployment Steps

1. Go to your Render dashboard
2. Click "New" and select "Web Service"
3. Connect your GitHub repository or upload your code
4. Configure the service:
   - Name: Choose a name for your service
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: Free or paid (as preferred)
5. Click "Create Web Service"

### Environment Variables

- `PORT` - Port to run the server on (automatically set by Render)

### Notes

- The application will automatically use the PORT environment variable provided by Render
- The application serves static files from the `public` directory

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Visit `http://localhost:3000` in your browser

## Data Management

The application works with JSON files for data storage:

- [repertoire.json](file:///c%3A/Users/%D0%90%D0%B4%D0%BC%D0%B8%D0%BD/Desktop/dombyra/repertoire.json) - Main repertoire data file
- [cleaned_repertoire.json](file:///c%3A/Users/%D0%90%D0%B4%D0%BC%D0%B8%D0%BD/Desktop/dombyra/cleaned_repertoire.json) - Cleaned version of repertoire data

To update the repertoire data, simply edit the [repertoire.json](file:///c%3A/Users/%D0%90%D0%B4%D0%BC%D0%B8%D0%BD/Desktop/dombyra/repertoire.json) file.

## API Endpoints

- `GET /api/search?piece=<title>&count=<number>` - Search for people who know a piece
- `GET /api/repertoire` - Get all repertoire data
- `GET /api/pieces` - Get all pieces

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
4. Copy the cleaned data to repertoire.json:
   ```
   cp cleaned_repertoire.json repertoire.json
   ```

## Deployment

To deploy on Render:
1. Create a new web service
2. Connect your repository
3. Set the build command to `npm install`
4. Set the start command to `npm start`