var express = require('express');
var app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

var path = require("path")
const multer = require('multer')

const { MongoClient, ObjectId } = require('mongodb');

const url = "mongodb://127.0.0.1:27017"
const dbName = 'pkr_db'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads')
    },
    filename: function (req, file, cb) {
        console.log("File in filename function:", file);
        var filetext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + filetext)
    }
})
const upload = multer({ storage: storage })

app.get("/", function (req, res) {
    res.send("HEY!! THERE")
})

app.get("/stud", function (req, res) {
    MongoClient.connect(url, (err, con) => {
        var db = con.db("pkr_db")
        db.collection("students").find()
            .toArray((err, data) => {
                console.log(data);
                res.send(data)
            })
    })
})

app.get("/stud/:id", (req, res) => {
    MongoClient.connect(url, function (err, conn) {
        var db = conn.db("pkr_db")
        db.collection("students").find({ _id: ObjectId(req.params.id) }).toArray((err, data) => {
            res.send(data)
        })
    })
})


app.post("/reg", upload.single("pic"), function (req, res) {
    console.log(req.body);
    console.log(req.file);
    req.body.profilepic = req.file.filename
    MongoClient.connect(url, function (err, con) {
        var db = con.db("pkr_db")
        db.collection("students").insertOne(req.body, function (err, data) {
            console.log(data);
            res.send("success")
        })
    })
})

app.patch('/update/:id', (req, res) => {
    MongoClient.connect(url, (err, conn) => {
        var db = conn.db('pkr_db');
        db.collection('students').updateOne(
            { _id: ObjectId(req.params.id) },
            { $set: req.body },
            (err, data) => {
                res.send(data)
            }
        )
    })
})

app.delete('/delete/:id', (req, res) => {
    MongoClient.connect(url, (err, conn) => {
        var db = conn.db('pkr_db');
        db.collection('students').findOneAndDelete(
            { _id: ObjectId(req.params.id) },
            { $set: req.body },
            (err, data) => {
                res.send(data)
            }
        )
    })
})




app.listen(2020, function () {
    console.log(" running 2020")
})