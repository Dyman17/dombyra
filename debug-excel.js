const xlsx = require("xlsx");

function debugExcel(path) {
  try {
    const wb = xlsx.readFile(path);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    
    // Get the raw data with headers
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Found ${rows.length} rows in the Excel file.`);
    
    // Show detailed information about row 2 (first data row)
    const row = rows[2]; // Third row (0-indexed)
    console.log(`\nDetailed analysis of row 2 (index 2):`);
    console.log(`Row length: ${row.length}`);
    
    for (let i = 0; i < Math.min(row.length, 50); i++) {
      const value = row[i];
      console.log(`Column ${i}: "${value}" (type: ${typeof value})`);
    }
    
    // Try to identify valid name/title pairs
    console.log(`\nTrying to identify valid pairs:`);
    
    // Check specific pairs we know should contain data
    const testPairs = [[0,1], [3,4], [6,7], [10,11], [13,14], [16,17]];
    
    for (const [nameIdx, titleIdx] of testPairs) {
      if (nameIdx < row.length && titleIdx < row.length) {
        const name = row[nameIdx];
        const title = row[titleIdx];
        console.log(`Pair (${nameIdx},${titleIdx}): Name="${name}", Title="${title}"`);
        
        // Check if this looks like a valid pair
        if (name && title && 
            name.toString().trim() !== '' && 
            title.toString().trim() !== '' &&
            !name.toString().toLowerCase().includes('есім') && 
            !title.toString().toLowerCase().includes('білетін')) {
          console.log(`  -> VALID: ${name.toString().trim()} knows ${title.toString().trim()}`);
        } else {
          console.log(`  -> INVALID: Contains header text or empty values`);
        }
      }
    }
    
  } catch (error) {
    console.error("Error debugging Excel file:", error.message);
  }
}

// Run the debug
debugExcel("people.xlsx");