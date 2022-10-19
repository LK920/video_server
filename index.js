import express from 'express';
import NodeCache from "node-cache"; //
import fetch from 'node-fetch';
import procTest from './public/js/processController.js';


const app = express();
const cache = new NodeCache({stdTTL : 15});
const port = 3000;
const todosUrl = "https://jsonplaceholder.typicode.com/todos";

app.get("/todos", (req, res)=>{
    if(cache.has("todos")){
        console.log("Getting it from cache");
        res.send(cache.get('todos'));
    }else{
        fetch(todosUrl)
            .then((response)=>response.json())
            .then((json)=>{
                cache.set('todos', json);
                console.log("Setting it from cache");
                res.send(json);
            });
    }
});

app.get('/stat', (req, res)=>{
    res.send(cache.getStats());
});

app.get('/proc',(req, res)=>{
    procTest();
    res.send('Complete Test');
});

app.post('/upload', (req, res)=>{

})

app.listen(port, ()=>{
    console.log(`Example server is running at port ${port}`);
});

