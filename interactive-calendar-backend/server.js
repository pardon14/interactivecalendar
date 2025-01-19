const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const reservationRoutes = require('./routes');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', reservationRoutes);

mongoose.connect('mongodb+srv://pardon14:password@interactivecalendar.4baoc.mongodb.net/?retryWrites=true&w=majority&appName=interactivecalendar', 
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.log(err));


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
