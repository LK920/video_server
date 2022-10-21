const LAMBDA_API = "http://localhost:3000/upload";
const player = videojs('player');
const file = document.querySelector('#file-input');

file.addEventListener('change', async ()=>{
    const {files} = file;
    const form = new FormData();
    form.append('video', files[0]);

    await fetch(LAMBDA_API,  {
        method : 'POST',
        body : form
    });
    
    
});
