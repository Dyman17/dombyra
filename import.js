const { Pool } = require("pg");
const fs = require("fs");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function importJson(path) {
  try {
    // Read the JSON file
    const rawData = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(`Loaded data from ${path}`);

    let importedCount = 0;

    // Process each group
    for (const groupName in data) {
      console.log(`Processing group: ${groupName}`);
      const group = data[groupName];
      
      // Process each participant in the group
      for (const participant of group) {
        const name = participant["Есім"];
        const repertoire = participant["Репертуар"];
        
        console.log(`Processing participant: ${name} with ${repertoire.length} pieces`);
        
        // Process each piece in the repertoire
        for (const title of repertoire) {
          if (!name || !title || 
              name.toString().trim() === '' || 
              title.toString().trim() === '') {
            continue;
          }
          
          const client = await pool.connect();
          try {
            // Insert person
            const p1 = await client.query(
              `INSERT INTO people(name) VALUES($1)
               ON CONFLICT (name) DO NOTHING RETURNING id`, [name.toString().trim()]
            );
            const personId = p1.rows[0]?.id || (await client.query(`SELECT id FROM people WHERE name=$1`, [name.toString().trim()])).rows[0].id;

            // Insert piece
            const p2 = await client.query(
              `INSERT INTO pieces(title) VALUES($1)
               ON CONFLICT (title) DO NOTHING RETURNING id`, [title.toString().trim()]
            );
            const pieceId = p2.rows[0]?.id || (await client.query(`SELECT id FROM pieces WHERE title=$1`, [title.toString().trim()])).rows[0].id;

            // Insert relationship
            await client.query(`INSERT INTO knows(person_id, piece_id) VALUES($1,$2)
              ON CONFLICT DO NOTHING`, [personId, pieceId]);
            
            console.log(`Imported: ${name.toString().trim()} - ${title.toString().trim()}`);
            importedCount++;
          } catch (error) {
            console.error(`Error importing ${name} - ${title}:`, error.message);
          } finally {
            client.release();
          }
        }
      }
    }

    console.log(`Import completed! ${importedCount} records processed.`);
    process.exit(0);
  } catch (error) {
    console.error("Error importing JSON file:", error.message);
    process.exit(1);
  }
}

// Run the import
importJson("cleaned_repertoire.json");