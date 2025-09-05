import express from 'express';

// create web server
const app = express();

// ask the web server to server the files in the frontend folder
app.use(express.static('frontend'));

// start the web server on port 3005
app.listen(3005,
  () => console.log('Listening on http://localhost:3005'));