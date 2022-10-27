import {spawn} from "child_process";
async function procTest (input, startTime, duration, filePath){
    try{
        return new Promise((resolve, reject)=>{
            const output = filePath+'output/output.mp4';
            const commandline = `-i ${input} -ss ${startTime} -t ${duration} ${output} -y`;
            const command = commandline.split(' ');
            const process = spawn('ffmpeg', command);
            process.on('close', ()=>{
                resolve(output)
            });
        });
    }catch(err){
        console.log(err);
    }
}

async function createThumbs (input, thumb){
    return new Promise((resolve, reject)=>{
        
        // command line 
        const commandLine = `-y -i ${input} -vf fps=1 ${thumb}thumb_%02d.png`;
        const command = commandLine.split(' ');
        spawn('ffmpeg', command).on('close', ()=>{
            resolve(200);
        });
    });
}

function test (){
    const ls = spawn('ls', ['-lh', '/usr']);
    ls.stdout.on('data', (data)=>{
        console.log(`stdout : ${data}`);
    });
    ls.stderr.on('data', (data)=>{
        console.error(`stderr : ${data}`);
    });
    ls.on('close', (code)=>{
        console.log(`chill_process exited with code ${code}`);
    });
}


export { procTest, test, createThumbs }