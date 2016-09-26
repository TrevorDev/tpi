"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const program = require('commander');
const cmdRunner_1 = require("./cmdRunner");
program
    .version('2.0.0')
    .command('install [name]')
    .description("install an npm package with its tsd file")
    .action(function (pkg) {
    return __awaiter(this, void 0, void 0, function* () {
        var cmdOptions = {
            onStdErr: function (data) {
                process.stdout.write(data);
            },
            onStdOut: function (data) {
                process.stdout.write(data);
            },
            onStart: function (cmdRunner) {
                console.log("Running: " + cmdRunner.cmd);
            }
        };
        if (!pkg) {
            let npm = new cmdRunner_1.default("npm install", cmdOptions);
            yield npm.run();
            return;
        }
        let tsdInstall = new cmdRunner_1.default("npm install @types/" + pkg + " --save", cmdOptions);
        let npmInstall = new cmdRunner_1.default("npm install " + pkg + " --save", cmdOptions);
        var output = yield tsdInstall.run();
        var output = yield npmInstall.run();
    });
});
program.parse(process.argv);
