/**
 * Created by mark on 2016/04/22.
 */


class CliLogin {

  static login(username, password) {
        if (username === 'mark' && password === "mark") {
            //this.authenticated = true;
            //this.roles.push("admin");
            return true;
        } else {
            return false;
        }
    }

}

export default CliLogin;