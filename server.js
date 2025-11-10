const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(express.static('public')); // сюда положишь index.html

// GET endpoint for serving repertoire data
app.get('/api/repertoire', (req, res) => {
  try {
    const rawData = fs.readFileSync('./cleaned_repertoire.json', 'utf8');
    const data = JSON.parse(rawData);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET endpoint for searching people who know a piece
app.get('/api/search', async (req, res) => {
  const { piece, count } = req.query;
  
  // Try to use database first
  try {
    const q = `
      SELECT people.name
      FROM knows
      JOIN people ON knows.person_id = people.id
      JOIN pieces ON knows.piece_id = pieces.id
      WHERE pieces.title ILIKE $1
      LIMIT $2
    `;
    const result = await pool.query(q, [`%${piece}%`, count || 1000]);
    res.json(result.rows);
  } catch (e) {
    // If database is not available, fall back to JSON file
    console.log('Database not available, falling back to JSON file');
    try {
      const rawData = fs.readFileSync('./cleaned_repertoire.json', 'utf8');
      const data = JSON.parse(rawData);
      
      // Search for people who know the piece
      const results = [];
      for (const groupName in data) {
        for (const participant of data[groupName]) {
          if (participant["Репертуар"].some(p => p.toLowerCase().includes(piece.toLowerCase()))) {
            results.push({ name: participant["Есім"] });
            if (count && results.length >= count) {
              break;
            }
          }
        }
        if (count && results.length >= count) {
          break;
        }
      }
      
      res.json(results);
    } catch (jsonError) {
      console.error('Error reading JSON file:', jsonError);
      res.status(500).json({ error: 'Database and JSON file not available' });
    }
  }
});

// GET endpoint for getting all pieces
app.get('/api/pieces', async (req, res) => {
  try {
    const result = await pool.query('SELECT title FROM pieces ORDER BY title');
    res.json(result.rows);
  } catch (e) {
    // If database is not available, fall back to JSON file
    console.log('Database not available, falling back to JSON file');
    try {
      const rawData = fs.readFileSync('./cleaned_repertoire.json', 'utf8');
      const data = JSON.parse(rawData);
      
      // Get all unique pieces
      const pieces = new Set();
      for (const groupName in data) {
        for (const participant of data[groupName]) {
          participant["Репертуар"].forEach(piece => pieces.add(piece));
        }
      }
      
      const result = Array.from(pieces).map(title => ({ title }));
      res.json(result);
    } catch (jsonError) {
      console.error('Error reading JSON file:', jsonError);
      res.status(500).json({ error: 'Database and JSON file not available' });
    }
  }
});

// POST endpoint for adding a person (admin only)
app.post('/api/people', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO people (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
      [name]
    );
    if (result.rows.length > 0) {
      res.json({ id: result.rows[0].id, name });
    } else {
      // If person already exists, get their ID
      const existing = await pool.query('SELECT id FROM people WHERE name = $1', [name]);
      res.json({ id: existing.rows[0].id, name });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST endpoint for adding a piece (admin only)
app.post('/api/pieces', async (req, res) => {
  const { title } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pieces (title) VALUES ($1) ON CONFLICT (title) DO NOTHING RETURNING id',
      [title]
    );
    if (result.rows.length > 0) {
      res.json({ id: result.rows[0].id, title });
    } else {
      // If piece already exists, get its ID
      const existing = await pool.query('SELECT id FROM pieces WHERE title = $1', [title]);
      res.json({ id: existing.rows[0].id, title });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST endpoint for linking a person and a piece (admin only)
app.post('/api/knows', async (req, res) => {
  const { person_id, piece_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO knows (person_id, piece_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [person_id, piece_id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST endpoint for adding a new repertoire entry
app.post('/api/repertoire', async (req, res) => {
  const { groupName, participantName, pieceTitle } = req.body;
  
  try {
    // Add person if not exists
    const personResult = await pool.query(
      'INSERT INTO people (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
      [participantName]
    );
    
    let personId;
    if (personResult.rows.length > 0) {
      personId = personResult.rows[0].id;
    } else {
      // If person already exists, get their ID
      const existingPerson = await pool.query('SELECT id FROM people WHERE name = $1', [participantName]);
      personId = existingPerson.rows[0].id;
    }
    
    // Add piece if not exists
    const pieceResult = await pool.query(
      'INSERT INTO pieces (title) VALUES ($1) ON CONFLICT (title) DO NOTHING RETURNING id',
      [pieceTitle]
    );
    
    let pieceId;
    if (pieceResult.rows.length > 0) {
      pieceId = pieceResult.rows[0].id;
    } else {
      // If piece already exists, get its ID
      const existingPiece = await pool.query('SELECT id FROM pieces WHERE title = $1', [pieceTitle]);
      pieceId = existingPiece.rows[0].id;
    }
    
    // Link person and piece
    await pool.query(
      'INSERT INTO knows (person_id, piece_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [personId, pieceId]
    );
    
    res.json({ success: true, message: 'Repertoire entry added successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET endpoint for serving repertoire data
app.get('/api/repertoire', (req, res) => {
  try {
    const rawData = fs.readFileSync('./cleaned_repertoire.json', 'utf8');
    const data = JSON.parse(rawData);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on port', process.env.PORT || 3000));