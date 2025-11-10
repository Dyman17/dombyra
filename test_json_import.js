const { Pool } = require("pg");
const fs = require("fs");

// For testing purposes, we'll just verify the data structure
async function testJsonImport(path) {
  try {
    // Read the JSON file
    const rawData = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(`Loaded data from ${path}`);
    
    let totalParticipants = 0;
    let totalPieces = 0;

    // Process each group
    for (const groupName in data) {
      console.log(`\nGroup: ${groupName}`);
      const group = data[groupName];
      totalParticipants += group.length;
      
      // Process each participant in the group
      for (const participant of group) {
        const name = participant["Есім"];
        const repertoire = participant["Репертуар"];
        totalPieces += repertoire.length;
        
        console.log(`  Participant: ${name} (${repertoire.length} pieces)`);
        
        // Show first 3 pieces as example
        const displayPieces = repertoire.slice(0, 3);
        console.log(`    Pieces: ${displayPieces.join(", ")}${repertoire.length > 3 ? "..." : ""}`);
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`  Total groups: ${Object.keys(data).length}`);
    console.log(`  Total participants: ${totalParticipants}`);
    console.log(`  Total pieces: ${totalPieces}`);

  } catch (error) {
    console.error("Error testing JSON import:", error.message);
    process.exit(1);
  }
}

// Run the test
testJsonImport("cleaned_repertoire.json");