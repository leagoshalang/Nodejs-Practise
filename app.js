const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/routes');


const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/api', routes);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


