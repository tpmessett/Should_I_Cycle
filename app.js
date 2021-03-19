// Imports
const express = require('express')
const app = express()
const port = 5000
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Static Files
app.use(express.static('public'));

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Navigation
app.get('', (req, res) => {
    res.render('index', { text: 'Hey' })
})

app.listen(port, () => console.info(`App listening on port ${port}`))





