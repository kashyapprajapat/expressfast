const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Route 1: whoisfast (sum from 1 to 100,000,000)
app.get('/whoisfast', (req, res) => {
  const total = sumRange(1, 100000000);  // Sum from 1 to 100,000,000
  res.json({ route: 'whoisfast', sum: total });
});

// Route 2: secondfast (sum from 1 to 1,000,000,000)
app.get('/secondfast', (req, res) => {
  const total = sumRange(1, 1000000000);  // Sum from 1 to 1,000,000,000
  res.json({ route: 'secondfast', sum: total });
});

// Function to sum numbers in a range
function sumRange(start, end) {
  let total = 0;
  for (let i = start; i <= end; i++) {
    total += i;
  }
  return total;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
