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