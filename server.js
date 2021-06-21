// importing
import express from "express";
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from "pusher";
import cors from 'cors'
import bodyParser from 'body-parser'

// app config
const app = express()
const port = process.env.PORT || 9000


const pusher = new Pusher({
  appId: "1222062",
  key: "e225cfcc518b55e1b9a5",
  secret: "cba8517c8b11217938af",
  cluster: "ap2",
  useTLS: true
});

// middlewares
app.use(express.json()); 

// DB config
// mongo password:mrG0f6GgBvMZX2tJ
const connection_url = "mongodb+srv://admin:mrG0f6GgBvMZX2tJ@cluster0.k41ye.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

mongoose.connect(connection_url, {
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.once("open", ()=>{
    console.log("DB connected.");
    
    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();
    
    changeStream.on('change' , (change) =>{
        console.log(change);
        
        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted' , {
                name: messageDetails.user,
                message : messageDetails.message
            })
        }
        else{
            console.log('Error triggering Pusher')
        }
    });
})



mongoose.connection.on('connect', function() {
    console.error('MongoDB has connected successfully');
  });
// api routes
app.get('/' , (req,res) =>{
    res.status(200).send("hellow!!");
    console.log("started on localhost.");
})

app.get('/message/sync', (req,res)=>{
    
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/message/new', (req,res)=>{
    const dbMessage = req.body

    console.log(dbMessage);

    Messages.create(dbMessage, (err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

// listening
app.listen(port, (req,res)=>{
    console.log(`listening on ${port}`);
})
