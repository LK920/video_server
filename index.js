import express from 'express';
import fileUpload from 'express-fileupload';
import FormData from 'form-data';

import NodeCache from "node-cache"; 
import fetch from 'node-fetch';
import fs from 'fs';

import path from 'path';
import cors from 'cors';

import { procTest, test, createThumbs } from './public/js/processController.js';


const app = express();
const cache = new NodeCache({stdTTL : 15});
const port = 3000;
const todosUrl = "https://jsonplaceholder.typicode.com/todos";
const __dirname = path.resolve();
const filePath = __dirname+'/public/file/';
const outputFile = filePath+'output';
app.use(express.static(__dirname));
app.use(cors());
app.use(fileUpload());

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

app.get('/test', (req, res)=>{
    test();
});

app.get('/', (req, res)=>{
    fs.readFile('./public/view/client.html', (err, data)=>{
        if(err){
            console.log(err);
            return res.status(500).send('<h1>500   ERROR</h1>')
        }
        res.writeHead(200, {"Content-Type" : 'text/html'});
        res.end(data);
    });
    
});

app.post('/thumbnails', async (req, res)=>{
    const file = req.files.video;
    file.mv(`${filePath}test.mp4`, async (err)=>{
        if(err){
            return res.status(500).send(err);
        }else{
            const thumbPath = filePath+'thumb/';
            const a = await createThumbs(filePath+'test.mp4', thumbPath);
            const form = new FormData();
            fs.readdir(a, (err, data)=>{
                if(err){
                    console.log(err);
                }
                
                data.forEach(el =>{
                    fs.readFile(a+el, (err, content)=>{
                        form.append(el.split('.')[0], content);
                    });
                });
                res.writeHead(200, {
                    'Content-type' : 'multipart/form-data'
                });
                console.log(form);
            });

        }
        
    });
    
});

app.get('/removeFile', (req, res)=>{
    
})

app.post('/upload', async (req, res)=>{
    const uploadfile = req.files.video;
    const start = req.body.startTime;
    const duration = req.body.duration;
    const filename = uploadfile.name;
    const savePath = `${filePath}${filename}`;
    uploadfile.mv(`${filePath}${filename}`, async function(err){
        if(err){
            return res.status(500).send(err);
        }else{
            const outputPath = await procTest(savePath, start, duration, filePath);
            console.log(outputPath);
            fs.readFile(outputPath, (err, content)=>{
                res.writeHead(200, {
                    'Content-type' : 'video/mp4',
                    "Content-dispostion" : `attachment; filename=output.mp4`
                });
                
                res.end(Buffer.from(content));
            });
        }
    });
})

app.get('/return', (req, res)=>{
    console.log('test');
});

app.listen(port, ()=>{
    console.log(`Example server is running at port ${port}`);
});

