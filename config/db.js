const mongoose = require('mongoose')

const MONGO_USER = "ugomes"
const MONGO_PASSWORD = "-RURU3eef157bb049"
const MONGO_HOSTNAME = "134.122.93.1"
const MONGO_PORT = "27017"
const MONGO_DB = "multi_manage"

const url = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`


mongoose.connect(url, {userNewUrlParser: true})
    .then(() => {
        console.log("CONNECTED TO MONGO")
    })
    .catch(err=>console.log("ERROR CONECTING RO MONGO"))