/**
 * Created by mark on 2016/04/22.
 */
import Main from './Main';

var app;

function start(){
    app = new Main();


    if (process.argv.find((arg)=> {
            if (arg === '--cli' || arg === '-c') {
                return arg;
            }
        })) {
        app.startConsole();
    } else {
        app.startServer();
    }
}

//start();

export {app};