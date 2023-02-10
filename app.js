const express = require('express');
const app = express();
const http = require('http');
const Primus = require('primus');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb'
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

const server = http.createServer(app);
const primus = new Primus(server);

primus.on('connection', (spark) => {
  console.log('new client connected');

  spark.on('data', (data) => {
    console.log('received data:', data);
    connection.query(
      'INSERT INTO messages (message) VALUES (?)',
      [data.message],
      (error, results) => {
        if (error) throw error;
        console.log('message inserted:', results.insertId);
        primus.write(data);
      }
    );
  });
});

server.listen(3000, () => {
  console.log('server is listening on port 3000');
});
