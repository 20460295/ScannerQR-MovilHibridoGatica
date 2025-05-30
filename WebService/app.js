const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());


app.use(express.urlencoded({ extended: true}));
app.use(express.json());



const route_codigos = require('./routes/codigos');
app.use('/codigos', route_codigos);

app.get('/', function(req, res) {
    res.send('Hello World!');
})

app.listen(3000, () => console.log('Example app listening on port 3000!'));