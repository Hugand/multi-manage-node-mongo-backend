const express = require('express')
const app = express()
const db = require('./config/db')
const bodyParser = require("body-parser");
// const users = require('./routes/users')
const cors = require("cors");

const port = 8080

const corsOptions = {
	origin: "https://multi-manage.ugomes.com"
};

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
// app.use(express.static(path))
// app.use('/orgs', orgs)

require('./routes/orgs')(app, "/mm-api")

app.listen(port, function(){
	console.log('Listening on 8080')
})
