import express from 'express';
import fileUpload from 'express-fileupload';
import JSZip from 'jszip';

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

app.get('/zip', (req, res)=>{
    fs.readFile('./public/view/jszip.html', (err, data)=>{
        res.writeHead(200, {'Content-type' : 'text/html'});
        res.end(data);
    });
})

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
            const status = await createThumbs(filePath+'test.mp4', thumbPath);
            fs.unlinkSync(filePath+'test.mp4');
            if(status == 200){
                const zip = new JSZip();
                // 파일 목록 읽기
                fs.readdir(thumbPath, (error, fileList)=>{
                    if(error){
                        res.status(500).send(error);
                    }else{
                        //파일 압축하기
                        fileList.forEach(el=>{
                            // image to binary
                            const fileName = el;
                            let data = fs.readFileSync(thumbPath+fileName);
                            zip.file(fileName, data, {base64: true});
                            fs.unlinkSync(thumbPath+fileName);
                        });
                        
                        // node에선 blob 지원하지 않음
                        zip.generateAsync({type:'nodebuffer'}).then((zipData)=>{
                            res.writeHead(200, {
                                'Content-Disposition' : `attachment; filename=thumb.zip`,
                                'Content-type' : 'application/zip'
                            });
    
                            res.write(zipData);
                            res.end();
                        });
                    }
                });
            }else{
                res.status(500).send('No thumbs');
            }
        }
        
    });
    
});

app.get('/timeline', (req, res)=>{
    fs.readFile('./public/view/timeline.html', (err, data)=>{
        if(err){
            console.log(err);
            return res.status(500).send('<h1>500   ERROR</h1>')
        }
        res.writeHead(200, {"Content-Type" : 'text/html'});
        res.end(data);
    });
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
            fs.readFile(outputPath, (err, content)=>{
                res.writeHead(200, {
                    'Content-type' : 'video/mp4',
                    "Content-dispostion" : `attachment; filename=output.mp4`
                });
                res.end(Buffer.from(content));
                fs.unlinkSync(savePath);
                fs.unlinkSync(outputPath);
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

