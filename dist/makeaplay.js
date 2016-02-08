"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
    function App(groups, users, hosts) {
        _classCallCheck(this, App);

        this.groups = groups;
        this.users = users;
        this.hosts = hosts;
        this.errors = [];
        this.parsedGroups = [];
        this.parsedUsers = [];
        this.parsedHosts = [];
    }

    //Check that the model is consistent.

    _createClass(App, [{
        key: "validateModel",
        value: function validateModel() {
            //basic user configuration validation
            this.parsedUsers = validateUsers();
            //basic group configuration validation
            this.parsedGroups = validateGroups();
            //basic host configuration validation
            this.parsedHosts = validateHosts(parsedUsers, parsedGroups);
            if (this.errors.length > 0) {
                return false;
            } else {
                return true;
            }
        }
    }, {
        key: "validateGroups",
        value: function validateGroups() {
            var _this = this;

            var groupnames = new Set();
            var gids = new Set();
            return this.groups.filter(function (elm, index, array) {
                if (!elm.name) {
                    _this.errors.push("Group with index " + index + " is missing a name property.");
                    return false;
                }
                if (!groupnames.has(elm.name)) {
                    groupnames.add(elm.name);
                } else {
                    _this.errors.push("Group " + elm.name + " has already been defined.");
                    return false;
                };
                if (elm.gid) {
                    if (!gids.has(elm.gid)) {
                        gids.add(elm.gid);
                    } else {
                        _this.errors.push("Gid " + elm.gid + " for " + elm.name + " has already been assigned.");
                        return false;
                    }
                }
                return true;
            });
        }
    }, {
        key: "validateUsers",
        value: function validateUsers() {
            var _this2 = this;

            var usernames = new Set();
            var uids = new Set();
            return this.users.filter(function (elm, index, array) {
                if (!elm.name) {
                    _this2.errors.push("User with index " + index + " is missing a name property.");
                    return false;
                }
                if (!usernames.has(elm.name)) {
                    if (elm.state != "present" && elm.state != "absent") {
                        _this2.errors.push("User " + elm.name + " has an invalid state.Must be 'present' or 'absent'.");
                        return false;
                    } else {
                        usernames.add(elm.name);
                    }
                } else {
                    _this2.errors.push("User " + elm.name + " has already been defined.");
                    return false;
                };
                if (elm.name && elm.uid) {
                    if (!uids.has(elm.uid)) {
                        uids.add(elm.uid);
                    } else {
                        _this2.errors.push("Uid " + elm.uid + " from " + elm.name + " has already been assigned.");
                        return false;
                    }
                }
                return true;
            });
        }
    }, {
        key: "validateHosts",
        value: function validateHosts(validUsers, validGroups) {
            var _this3 = this;

            //first clone the hosts array
            var clonedHosts = [];
            this.hosts.forEach(function (host) {
                var clonedHost = {};
                Object.assign(clonedHost, host);
                clonedHosts.push(clonedHost);
            });
            //filter and clean up cloned hosts
            return clonedHosts.filter(function (host, hindex, harray) {
                //if the host is missing a name remove from results.
                if (!host.name) {
                    _this3.errors.push("Host with index " + hindex + " is missing a name property.");
                    return false;
                }

                //user validation
                host.users = host.users.filter(function (user, uindex, uarray) {
                    //check if current user has been defined
                    if (!_this3.findValidUser(user.name, validUsers)) {
                        _this3.errors.push("User " + user.name + " for " + host.name + " is not defined in the user config file.");
                        return false;
                    }
                    //check if the users allowed to login as the current user exist
                    //if not remove non-existing user from authorized_keys list
                    user.authorized_keys = user.authorized_keys.filter(function (key, kindex, karray) {
                        var userObj = _this3.findValidUser(key, validUsers);
                        //has the authorized_key user been defined
                        if (!userObj) {
                            _this3.errors.push("The authorized user " + key + " for " + user.name + " for " + host.name + " has not been defined.");
                            return false;
                        }
                        //does the defined authorized_key user have a public key
                        if (userObj && !userObj.key) {
                            _this3.errors.push("The authorized user " + key + " for " + user.name + " for " + host.name + " does not have a key defined.");
                            return false;
                        }
                        return true;
                    });
                    return true;
                });

                //group and group membership validation
                host.groups = host.groups.filter(function (group, gindex, garray) {
                    //has the group been defined
                    if (!_this3.findValidGroup(group.name, validGroups)) {
                        _this3.errors.push("The group " + group.name + " for host " + host.name + " has not been defined.");
                        return false;
                    } else {
                        //have group members been defined
                        group.members = group.members.filter(function (member, mindex, marray) {
                            if (!_this3.findValidUser(member, host.users)) {
                                _this3.errors.push("The member " + member + " of group " + group.name + " for host " + host.name + " has not been defined.");
                                return false;
                            } else {
                                return true;
                            }
                        });
                        return true;
                    }
                });
                return true;
            });
        }
    }, {
        key: "findValidUser",
        value: function findValidUser(username, validUsers) {
            return validUsers.find(function (item) {
                if (item.name === username) {
                    return item;
                }
            });
        }
    }, {
        key: "findValidGroup",
        value: function findValidGroup(groupname, validGroups) {
            return validGroups.find(function (item) {
                if (item.name === groupname) {
                    return item;
                }
            });
        }
    }]);

    return App;
}();

exports.default = App;
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
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MakeAPlay = function () {
    function MakeAPlay() {
        _classCallCheck(this, MakeAPlay);
    }

    _createClass(MakeAPlay, [{
        key: 'loadModel',
        value: function loadModel() {
            this.groups = JSON.parse(_fs2.default.readFileSync('conf/groups.js'));
            this.users = JSON.parse(_fs2.default.readFileSync('conf/users.js'));
            this.hosts = JSON.parse(_fs2.default.readFileSync('conf/hosts.js'));
        }

        //Check that the model is consistent.

    }, {
        key: 'validateModel',
        value: function validateModel() {
            var _this = this;

            this.errors = [];
            //User configuration collections
            var usernames = new Set();
            var uids = new Set();

            //Group configuration collections
            var groupnames = new Set();
            var gids = new Set();

            //basic user configuration validation
            this.users.forEach(function (elm, index, array) {
                if (!usernames.has(elm.name)) {
                    usernames.add(elm.name);
                    if (elm.state != "present" && elm.state != "absent") {
                        _this.errors.push('User ' + elm.name + ' has an invalid state. Must be \'present\' or \'absent\'.');
                    }
                } else {
                    _this.errors.push('User ' + elm.name + ' has already been defined.');
                };
                if (elm.uid) {
                    if (!uids.has(elm.uid)) {
                        uids.add(elm.uid);
                    } else {
                        _this.errors.push('Uid ' + elm.uid + ' from ' + elm.name + ' has already been assigned');
                    }
                }
            });

            //basic group configuration validation
            this.groups.forEach(function (elm, index, array) {
                if (!groupnames.has(elm.name)) {
                    groupnames.add(elm.name);
                } else {
                    _this.errors.push('Group ' + elm.name + ' has already been defined.');
                };
                if (elm.gid) {
                    if (!gids.has(elm.gid)) {
                        gids.add(elm.gid);
                    } else {
                        _this.errors.push('Gid ' + elm.gid + ' from ' + elm.name + ' has already been assigned');
                    }
                }
            });

            //basic host configuration validation
            this.hosts.forEach(function (host, hindex, harray) {
                //user validation
                host.users.forEach(function (user, uindex, uarray) {
                    if (!usernames.has(user.name)) {
                        _this.errors.push('User ' + user.name + ' for ' + host + ' is not defined in the user.js config file');
                    }
                    user.authorized_keys.forEach(function (key, kindex, karray) {
                        if (usernames.has(key.name)) {
                            var userObj = _this.users.find(function (cuser, cindex, carray) {
                                if (cuser.name == user.name) {
                                    return cuser;
                                }
                            });

                            if (userObj && !userObj.key) _this.errors.push('The authorized user ' + key + ' for ' + user.name + ' for ' + host + ' does not have a key defined.');
                        }
                    });
                    //group and group membership validation
                    host.groups.forEach(function (group, gindex, garray) {
                        if (!groupnames.has(group.name)) {
                            _this.errors.push('The group ' + group + ' for host ' + host + ' has not been defined.');
                        }

                        group.members.forEach(function (member, mindex, marray) {
                            if (!usernames.has(member)) {
                                _this.errors.push('The member ' + member + ' of group ' + group + ' for host ' + hosts + ' has not been defined.');
                            }
                        });
                    });
                });
            });

            if (this.errors.length > 0) {
                return false;
            } else {
                return true;
            }
        }
    }]);

    return MakeAPlay;
}();

var play = new MakeAPlay();
play.loadModel();

if (!play.validateModel()) {
    play.errors.forEach(function (error) {
        console.log(error);
    });
}