require('dotenv').config()

const express = require("express");
const app = express();
const Note = require('./models/note')

const cors = require('cors');
const note = require('./models/note');
const { default: mongoose } = require('mongoose');

app.use(cors())
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(express.json());
app.use(requestLogger);


app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
});


app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
});

app.get("/api/notes/:id", (request, response) => {


    Note.findById(request.params.id)
      .then((note) => {
        if(note){
          response.json(note);
        } else {
          response.status(404).end()
        }
      })
      .catch((error) => {
        console.log(error);
        response.status(404).send({error: 'malformatted id'})
      })
});

app.delete("/api/notes/:id", (request, response) => {
  const id = request.params.id
  Note.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => {
      console.log(error);
      response.status(400).status({
        error: 'malformatted id'
      })
    })
});

app.use(unknownEndpoint);

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
