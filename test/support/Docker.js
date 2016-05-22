'use strict';

var child_process = require('child_process');

class Docker {
    startDocker(image) {
        //image should be vincentsshpasswd or vincentsshkeys
        return new Promise(resolve=>{
            child_process.exec(`docker run -d --name vincenttest ${image}`, (error, stdout, stderr)=> {
                    //delay needed on some machines for docker to respond to ansible
                    child_process.exec("sleep 1 && docker inspect vincenttest | grep -E '\s\"IPAddress\":' | head -1 |  cut -d '\"' -f 4",
                        (error, stdout, stderr)=> {
                            resolve("172.17.0.2");
                            //resolve(stdout.substring(0,stdout.length-1));
                    });
                });
        });
    }

    stopDocker(){
       return new Promise(resolve=>{
           child_process.exec(`docker stop vincenttest`,
               (error, stdout, stderr)=> {
                   child_process.exec(`docker rm vincenttest`, (error, stdout, stderr)=> {
                       resolve();
                   });
               });
       });
    }
}

//var docker = new Docker();
//docker.startDocker().then(docker.stopDocker()).then(console.log("done"));
//docker.startDocker().then(docker.stopDocker);

export default Docker;