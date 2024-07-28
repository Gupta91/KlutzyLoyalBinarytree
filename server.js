const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));
app.use(bodyParser.json());

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
