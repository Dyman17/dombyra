const xlsx = require("xlsx");

function testImport(path) {
  try {
    const wb = xlsx.readFile(path);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    
    // Get the raw data with headers
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Found ${rows.length} rows in the Excel file.`);

    let recordCount = 0;

    // Show first few rows for debugging
    console.log("\nFirst 3 data rows:");
    for (let i = 1; i < Math.min(4, rows.length); i++) {
      console.log(`Row ${i}:`, rows[i]);
    }

    // Process the rows, skipping the first row (headers)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Process pairs of columns (Name, PieceTitle)
      // Pairs are at indices: (1,2), (4,5), (7,8), (11,12), (14,15), etc.
      const pairs = [
        [1, 2], [4, 5], [7, 8], [11, 12], [14, 15], 
        [17, 18], [20, 21], [23, 24], [26, 27], [29, 30],
        [32, 33], [35, 36], [38, 39], [41, 42], [45, 46], [48, 49]
      ];
      
      for (const [nameIndex, titleIndex] of pairs) {
        // Check if indices are valid
        if (nameIndex >= row.length || titleIndex >= row.length) {
          continue;
        }
        
        const name = row[nameIndex];
        const title = row[titleIndex];
        
        // Debug output
        if (i === 2) { // Show details for row 2 (first data row)
          console.log(`Checking pair (${nameIndex}, ${titleIndex}): Name="${name}", Title="${title}"`);
        }
        
        // Skip if either name or title is empty
        if (!name || !title || 
            name.toString().trim() === '' || 
            title.toString().trim() === '' ||
            name.toString().toLowerCase().includes('есім') || 
            title.toString().toLowerCase().includes('білетін')) {
          continue;
        }
        
        console.log(`Found: ${name.toString().trim()} - ${title.toString().trim()}`);
        recordCount++;
      }
    }

    console.log(`\nTest completed! Would import ${recordCount} records.`);
  } catch (error) {
    console.error("Error testing import:", error.message);
    console.error(error.stack);
  }
}

// Run the test
testImport("people.xlsx");