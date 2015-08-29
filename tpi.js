var cp = require('child_process');
var program = require('commander');
var exec = cp.exec;
var CmdRunner = (function () {
    function CmdRunner(cmd) {
        this.cmd = cmd;
    }
    CmdRunner.prototype.run = function (childProcessHandler) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.childProcess) {
                resolve(false);
                return;
            }
            _this.childProcess = exec(_this.cmd, function (err, out) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(out);
                }
            });
            if (childProcessHandler) {
                childProcessHandler(_this.childProcess, _this);
            }
        });
    };
    CmdRunner.prototype.sendToStdin = function (text) {
        if (this.childProcess) {
            this.childProcess.stdin.write(text);
        }
    };
    CmdRunner.prototype.kill = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.childProcess) {
                if (process.platform === 'win32') {
                    exec('taskkill /pid ' + _this.childProcess.pid + ' /T /F', function () {
                        resolve(true);
                    });
                }
                else {
                    exec('kill -s ' + "SIGKILL" + ' ' + _this.childProcess.pid, function () {
                        resolve(true);
                    });
                }
                _this.childProcess = null;
            }
            else {
                resolve(false);
            }
        });
    };
    return CmdRunner;
})();
;
function cph(cp, cmdRunner) {
    console.log("Running: " + cmdRunner.cmd);
    cp.stdout.on('data', function (data) {
        process.stdout.write(data);
    });
    cp.stderr.on('data', function (data) {
        process.stdout.write(data);
    });
}
program
    .version('0.0.1')
    .command('install [name]')
    .description("install an npm package with its tsd file")
    .action(function (pkg) {
    if (!pkg) {
        var tsd = new CmdRunner("tsd install");
        var npm = new CmdRunner("npm install");
        npm.run(cph)
            .then(tsd.run.bind(tsd, cph));
        return;
    }
    var tsdQuery = new CmdRunner("tsd query " + pkg);
    var tsdInstall = new CmdRunner("tsd install " + pkg + " --save");
    var npmInstall = new CmdRunner("npm install " + pkg + " --save");
    tsdQuery.run(cph)
        .then(function (out) {
        var numberOfResults = (out.match(/ - /g) || []).length;
        if (numberOfResults != 1) {
            console.log("tsd package not found");
            throw "tsd package not found";
        }
        return tsdInstall.run(cph);
    })
        .then(function (out) {
        return npmInstall.run(cph);
    })
        .catch(function (err) {
        console.log("\nInstall failed");
    });
});
program.parse(process.argv);
