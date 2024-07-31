// import express
const express = require('express');
// import file system module
const fs = require('fs');
// import path
const path = require('path');
// helper method for generating unique ids
const uniqid = require('uniqid');

// Creates new app with express
const app = express();
// Port
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSOJN and urlencoding form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// Get route which sends back the index.html page
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

// Get route which sends back the notes.html page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
})

// Get route to read the db.json file and send back the parse JSON data
app.get('/api/notes', (req, res) => {
    fs.readFile('db/db.json', 'utf8', (err, data) => {
        let jsonData = JSON.parse(data);
        console.log(jsonData);
        res.json(jsonData);
    })
})

// Reads newly added notes from the request body and then adds them to the db.json file
const readThenAppendToJSON = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            const parseData = JSON.parse(data);
            parseData.push(content);
            writeNewNoteToJson(file, parseData);
        }
    })
}

// Writes data to db.json 
// utilized within the readThenAppendToJson function
const writeNewNoteToJson = (destination, content) => {
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Destination written to ${destination}`);
        }
    })
}

// Post - Receives a new note, save it to the request body, adds it to the db.json file, and returns the new note to the client
app.post('/api/notes', (req,res) => {
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title: title,
            text: text,
            id: uniqid()
        }

        readThenAppendToJSON(newNote, 'db/db.json');

        const response = {
            status: 'success',
            body: newNote
        }

        res.json(response);
    } else {
        res.json('Error in posting new note');
    }
})

// Delete - reads the db.json file, uses the json objects uniqids to match the object to be deleted, removes that object from the db.json file, then rewrites the db.json file
app.delete("/api/notes/:id", (req, res) => {
    let id = req.params.id;
    let parsedData;
    fs.readFile('db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        parsedData = JSON.parse(data);
        const filterData = parsedData.filter((note) => note.id !== id);
        writeNewNoteToJson('db/db.json', filterData);
      }
    });
    res.send(`Deleted note with ${req.params.id}`);
  });
  
  // App.listen is used start up our local server
  app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
  );