'use strict';

var groups = JSON.parse(fs.readFileSync('conf/groups.js'));
var users = JSON.parse(fs.readFileSync('conf/users.js'));
var hosts = JSON.parse(fs.readFileSync('conf/hosts.js'));

var play = new App(groups, users, hosts);

if (!play.validateModel()) {
    play.errors.forEach(function (error) {
        console.log(error);
    });
}