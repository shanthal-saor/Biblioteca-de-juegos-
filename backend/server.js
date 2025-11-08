// crear un servidor con node.js y express//
const http = require ( "http")
const express = require('express');
const app = express();
app.use (express.json())
const PORT = 3000;

app.get ("/", (request, response)=> {
  response. statusCode = 200;
  response. end ('Hola Mundo, este es el servidor!')
})


app.listen ( 3000, () => {
  console.log(' servidor ejecutandose en http://localhost:3000');
})
  
