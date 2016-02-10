'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('modules/base');

var _base2 = _interopRequireDefault(_base);

var _ini = require('ini');

var _ini2 = _interopRequireDefault(_ini);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
    function App() {
        _classCallCheck(this, App);

        this.config = _ini2.default.parse(_fs2.default.readFileSync('./config.ini', 'utf-8'));
    }

    //load up all the configuration files.

    _createClass(App, [{
        key: 'load',
        value: function load() {
            this.groups = JSON.parse(_fs2.default.readFileSync(this.config.confdir + 'groups.js'));
            this.users = JSON.parse(_fs2.default.readFileSync(this.config.confdir + 'users.js'));
            this.hosts_includes = JSON.parse(_fs2.default.readFileSync(this.config.confdir + 'hosts.js'));
            //includes
            this.ssh_includes = JSON.parse(_fs2.default.readFileSync(this.config.confdir + 'includes/ssh-configs.js'));
            this.sudo_includes = JSON.parse(_fs2.default.readFileSync(this.config.confdir + 'includes/sudo-entries.js'));
            this.users_includes = JSON.parse(_fs2.default.readFileSync(this.config.confdir + 'includes/user-categories.js'));
            this.groups_includes = JSON.parse(_fs2.default.readFileSync(this.config.confdir + 'includes/groups-categories.js'));
        }
    }, {
        key: 'init',
        value: function init() {
            var play = new _base2.default(groups, users, hosts);
            if (!play.validateModel()) {
                play.errors.forEach(function (error) {
                    console.log(error);
                });
            }
        }
    }]);

    return App;
}();