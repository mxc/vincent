/**
 * Created by mark on 2016/04/22.
 */
import CliLogin from './CliLogin';
import readline from 'readline';
import child_process from 'child_process';
import tls from 'tls';

if (process.argv.find((arg)=> {
        if (arg === '--cli' || arg === '-c') {
            return arg;
        }
    })) {
    //go to cli mode -> no authentication or security
} else {

}