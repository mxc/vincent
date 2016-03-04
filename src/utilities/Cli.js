/**
 * Created by mark on 2016/03/02.
 */
import readlineSync from 'readline-sync';

class Cli {


    getUserPassword() {
        return readlineSync.question(`Please enter the remote user's password:`,
            {
                hideEchoBack: true
            });
    }

    getSudoPassword() {
        return readlineSync.question(`Please enter the remote user's sudo password:`,
            {
                hideEchoBack: true
            });
    }

}