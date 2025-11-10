const xlsx = require("xlsx");

function analyzeExcel(path) {
  try {
    const wb = xlsx.readFile(path);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    
    // Get the raw data with headers
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`Total rows: ${rows.length}`);
    console.log(`Total columns in first row: ${rows[0] ? rows[0].length : 0}`);
    
    // Show first few rows
    console.log("\nFirst 5 rows:");
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      console.log(`Row ${i}:`, rows[i]);
    }
    
    // Try to get data with column names
    const namedRows = xlsx.utils.sheet_to_json(sheet);
    console.log(`\nNamed rows count: ${namedRows.length}`);
    if (namedRows.length > 0) {
      console.log("First named row:", namedRows[0]);
      console.log("Named row keys:", Object.keys(namedRows[0]));
    }
    
  } catch (error) {
    console.error("Error analyzing Excel file:", error.message);
  }
}

analyzeExcel("people.xlsx");