
import program = require('commander')
import CmdRunner from "./cmdRunner"


program
  .version('2.0.0')
  .command('install [name]')
  //.option('-s, --save', 'save to tsd and package.json file')
  .description("install an npm package with its tsd file")
  .action(async function(pkg){

    var cmdOptions = {
      onStdErr: function(data){
        process.stdout.write(data);
      },
      onStdOut: function(data){
        process.stdout.write(data);
      },
      onStart: function(cmdRunner:CmdRunner){
        console.log("Running: "+cmdRunner.cmd);
      }
    }
    if(!pkg){
      let npm = new CmdRunner("npm install", cmdOptions)
      await npm.run()
      return
    }
    let tsdInstall = new CmdRunner("npm install @types/"+pkg+" --save", cmdOptions)
    let npmInstall = new CmdRunner("npm install "+pkg+" --save", cmdOptions)

    var output = await tsdInstall.run()
    var output = await npmInstall.run()


  })

program.parse(process.argv)
