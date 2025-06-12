const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

let links = {};
const DATA_FILE = 'links.json';

// Load existing links
if (fs.existsSync(DATA_FILE)) {
  links = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save links to disk
function saveLinks() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
}

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Generate short link
app.post('/shorten', (req, res) => {
  const originalUrl = req.body.url;
  const shortId = nanoid(6);
  links[shortId] = originalUrl;
  saveLinks();
  res.send(`<p>Short link: <a href="/${shortId}">http://localhost:${PORT}/${shortId}</a></p>`);
});

// Countdown redirect page
app.get('/:shortId', (req, res) => {
  const shortId = req.params.shortId;
  const target = links[shortId];
  if (target) {
    res.sendFile(path.join(__dirname, 'public', 'countdown.html'));
  } else {
    res.status(404).send('Link not found.');
  }
});

// API to get redirect target
app.get('/api/get-link/:shortId', (req, res) => {
  const shortId = req.params.shortId;
  if (links[shortId]) {
    res.json({ url: links[shortId] });
  } else {
    res.status(404).json({ error: 'Link not found.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
