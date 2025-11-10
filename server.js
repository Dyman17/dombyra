const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Load JSON data with error handling
let repertoireData;
try {
  repertoireData = require("./repertoire.json"); // Make sure the file is in the same directory as server.js
  console.log("Repertoire data loaded successfully");
} catch (err) {
  console.error("Error loading repertoire.json:", err);
  // Provide fallback data to prevent server crash
  repertoireData = { "Үлкен топ": [], "Кіші топ": [] };
}

// API endpoint for serving repertoire data
app.get("/api/repertoire", (req, res) => {
  try {
    res.json(repertoireData);
  } catch (err) {
    console.error("Error serving repertoire data:", err);
    res.status(500).send("Error serving repertoire data");
  }
});

// API endpoint for searching people who know a piece
app.get("/api/search", (req, res) => {
  const piece = req.query.piece?.toLowerCase() || "";
  const count = parseInt(req.query.count) || 1000;

  try {
    const results = [];
    
    // Search in both groups
    for (const group in repertoireData) {
      for (const participant of repertoireData[group]) {
        // Check if participant knows the piece
        if (participant["Репертуар"].some(p => p.toLowerCase().includes(piece))) {
          results.push({ name: participant["Есім"] });
          // Limit results if count is specified
          if (results.length >= count) {
            break;
          }
        }
      }
      // Break outer loop too if we have enough results
      if (results.length >= count) {
        break;
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).send("Error during search");
  }
});

// API endpoint for getting all pieces
app.get("/api/pieces", (req, res) => {
  try {
    // Get all unique pieces
    const pieces = new Set();
    for (const group in repertoireData) {
      for (const participant of repertoireData[group]) {
        participant["Репертуар"].forEach(piece => pieces.add(piece));
      }
    }
    
    const result = Array.from(pieces).map(title => ({ title }));
    res.json(result);
  } catch (err) {
    console.error("Error fetching pieces:", err);
    res.status(500).send("Error fetching pieces");
  }
});

// Serve frontend for all non-API routes
app.get("/", (req, res) => {
  // Check if public/index.html exists
  const indexPath = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML response with embedded frontend
    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Поиск по репертуару</title>
      <style>
      body { 
        font-family: Arial, sans-serif; 
        padding: 0; 
        background: #f5f5f5; 
        margin: 0;
      }
      
      .container {
        width: 90%;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      h1 { 
        color: #333; 
        text-align: center;
        margin-bottom: 30px;
        font-size: 24px;
      }
      
      #search-form { 
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        margin-bottom: 25px;
      }
      
      input, button { 
        padding: 12px;
        margin: 8px 5px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 44px; /* Minimum touch target size */
        min-width: 44px;  /* Minimum touch target size */
      }
      
      #piece { 
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 15px;
      }
      
      #count { 
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 15px;
      }
      
      button {
        background: #4CAF50;
        color: white;
        border: none;
        cursor: pointer;
        font-weight: bold;
        width: 100%;
        margin-bottom: 10px;
        padding: 15px;
      }
      
      button:hover {
        background: #45a049;
      }
      
      #copy {
        background: #2196F3;
      }
      
      #copy:hover {
        background: #0b7dda;
      }
      
      #result { 
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        min-height: 50px;
      }
      
      #result ol { 
        padding-left: 25px;
        font-size: 18px;
      }
      
      #result li { 
        margin: 10px 0;
        padding: 5px 0;
      }
      
      .error {
        color: #f44336;
        background: #ffebee;
        padding: 15px;
        border-radius: 4px;
      }
      
      .success {
        color: #333;
      }
      
      /* Mobile responsiveness */
      @media (max-width: 600px) {
        body {
          padding: 0;
        }
        
        .container {
          width: 95%;
          padding: 15px;
        }
        
        h1 {
          font-size: 20px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        #search-form {
          padding: 20px;
        }
        
        input, button {
          font-size: 16px; /* Prevents zoom on iOS */
        }
        
        #piece, #count {
          width: 100%;
          margin-bottom: 15px;
        }
        
        button {
          width: 100%;
          padding: 15px;
          margin-bottom: 10px;
        }
        
        #result {
          padding: 20px;
        }
        
        #result ol {
          font-size: 16px;
        }
      }
      
      /* Desktop layout */
      @media (min-width: 601px) {
        #search-form > div {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
        }
        
        #piece {
          width: 350px;
          margin-bottom: 0;
        }
        
        #count {
          width: 180px;
          margin-bottom: 0;
        }
        
        #search-form button {
          width: auto;
          margin-bottom: 0;
        }
      }
      </style>
      </head>
      <body>
        <div class="container">
          <h1>Поиск участников по репертуару</h1>
          
          <div id="search-form">
            <div>
              <input id="piece" placeholder="Название произведения" autofocus>
              <input id="count" type="number" placeholder="Количество участников (оставьте пустым для всех)" min="1" max="1000">
            </div>
            <div>
              <button id="search">Найти участников</button>
              <button id="copy">Скопировать результат</button>
              <button id="show-all">Показать весь репертуар</button>
            </div>
          </div>
          
          <div id="result">
            <p style="color: #666; text-align: center;">Введите название произведения и нажмите "Найти участников"</p>
          </div>
        </div>
      
      <script>
      document.getElementById('search').onclick = async () => {
        const piece = document.getElementById('piece').value.trim();
        const count = document.getElementById('count').value || '';
        
        if (!piece) {
          document.getElementById('result').innerHTML = '<p class="error">Пожалуйста, введите название произведения</p>';
          return;
        }
        
        try {
          // Show loading message
          document.getElementById('result').innerHTML = '<p style="color: #666; text-align: center;">Поиск...</p>';
          
          const url = count ? \`/api/search?piece=\${encodeURIComponent(piece)}&count=\${count}\` : \`/api/search?piece=\${encodeURIComponent(piece)}\`;
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(\`HTTP error! status: \${res.status}\`);
          }
          const data = await res.json();
          
          if (data.length === 0) {
            document.getElementById('result').innerHTML = \`<div class="error">Никто не знает произведение "\${piece}".</div>\`;
            return;
          }
          
          let html = \`<h3>Участники, знающие "\${piece}":</h3>\`;
          html += '<ol>';
          data.forEach((person, index) => {
            html += \`<li>\${person.name}</li>\`;
          });
          html += '</ol>';
          html += \`<p style="color: #666; font-style: italic;">Всего найдено: \${data.length}</p>\`;
          
          document.getElementById('result').innerHTML = html;
        } catch (error) {
          console.error('Error searching repertoire:', error);
          document.getElementById('result').innerHTML = \`<div class="error">Ошибка поиска: \${error.message}</div>\`;
        }
      };
      
      document.getElementById('copy').onclick = () => {
        const resultDiv = document.getElementById('result');
        const text = resultDiv.innerText || resultDiv.textContent;
        
        if (!text.trim() || text.includes("Введите название произведения") || text.includes("Поиск...")) {
          alert('Нет данных для копирования');
          return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
          alert('Результат скопирован в буфер обмена!');
        }).catch(err => {
          console.error('Failed to copy: ', err);
          alert('Не удалось скопировать текст');
        });
      };
      
      // Allow Enter key to trigger search
      document.getElementById('piece').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          document.getElementById('search').click();
        }
      });
      
      document.getElementById('count').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          document.getElementById('search').click();
        }
      });
      
      document.getElementById('show-all').onclick = async () => {
        try {
          // Show loading message
          document.getElementById('result').innerHTML = '<p style="color: #666; text-align: center;">Загрузка репертуара...</p>';
          
          const res = await fetch('/api/repertoire');
          if (!res.ok) {
            throw new Error(\`HTTP error! status: \${res.status}\`);
          }
          const data = await res.json();
          
          let html = '<h2 style="color: #333; margin-bottom: 20px;">Весь репертуар</h2>';
          
          for (const groupName in data) {
            html += \`<div style="margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 5px;">\`;
            html += \`<h3 style="color: #4CAF50; margin-top: 0;">\${groupName} (\${data[groupName].length} участников)</h3>\`;
            
            for (const participant of data[groupName]) {
              html += \`<div style="margin-bottom: 15px; padding-left: 20px;">\`;
              html += \`<div style="font-weight: bold; color: #333;">\${participant["Есім"]} <span style="font-weight: normal; color: #666;">(\${participant["Репертуар"].length} произведений)</span></div>\`;
              html += \`<div style="margin-top: 5px;">\`;
              
              // Sort repertoire alphabetically
              const sortedRepertoire = [...participant["Репертуар"]].sort();
              
              for (const piece of sortedRepertoire) {
                html += \`<div style="margin-left: 20px; color: #555;">• \${piece}</div>\`;
              }
              
              html += \`</div>\`;
              html += \`</div>\`;
            }
            
            html += \`</div>\`;
          }
          
          document.getElementById('result').innerHTML = html;
        } catch (error) {
          console.error('Error loading repertoire:', error);
          document.getElementById('result').innerHTML = \`<div class="error">Ошибка загрузки репертуара: \${error.message}</div>\`;
        }
      };
      </script>
      </body>
      </html>
    `);
  }
});

app.get("/index.html", (req, res) => {
  // Check if public/index.html exists
  const indexPath = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Redirect to root
    res.redirect("/");
  }
});

// Catch-all route for SPA routing
app.get("*", (req, res) => {
  // Check if public/index.html exists
  const indexPath = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback to root
    res.redirect("/");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});