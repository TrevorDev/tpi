import cp = require('child_process')
import program = require('commander');
let exec = cp.exec

class CmdRunner {
    private childProcess: cp.ChildProcess
    constructor(public cmd: string) { }
    run(childProcessHandler?){
        return new Promise((resolve, reject) => {
          if(this.childProcess){
            //already started
            resolve(false)
            return
          }
          this.childProcess = exec(this.cmd, function(err, out){
            if(err){
              reject(err)
            }else{
              resolve(out)
            }
          })
          if(childProcessHandler){
            childProcessHandler(this.childProcess, this)
          }
        })
    }
    sendToStdin(text:string){
      if(this.childProcess){
        this.childProcess.stdin.write(text)
      }
    }

    kill(){
      return new Promise((resolve, reject) => {
        if(this.childProcess){
          if(process.platform === 'win32'){
            exec('taskkill /pid '+ this.childProcess.pid + ' /T /F', function(){
              resolve(true)
            })
          }else{
            //not tested on linux or osx yet
            exec('kill -s ' + "SIGKILL" + ' ' + this.childProcess.pid, function(){
              resolve(true)
            })
          }
          this.childProcess = null
        }else{
          resolve(false)
        }
      })
    }
};

function cph(cp, cmdRunner){
  console.log("Running: "+cmdRunner.cmd)
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
  //.option('-s, --save', 'save to tsd and package.json file')
  .description("install an npm package with its tsd file")
  .action(function(pkg){
    if(!pkg){
      let tsd = new CmdRunner("tsd install")
      let npm = new CmdRunner("npm install")
      npm.run(cph)
      .then(tsd.run.bind(tsd, cph))
      return
    }
    let tsdQuery = new CmdRunner("tsd query "+pkg)
    let tsdInstall = new CmdRunner("tsd install "+pkg+" --save")
    let npmInstall = new CmdRunner("npm install "+pkg+" --save")
    tsdQuery.run(cph)
      .then((out:string)=>{
        let numberOfResults = (out.match(/ - /g)||[]).length
  			if(numberOfResults != 1){
          console.log("tsd package not found")
          throw "tsd package not found"
  			}
        return tsdInstall.run(cph)
      })
      .then((out:string)=>{
        return npmInstall.run(cph)
      })
      .catch((err)=>{
        console.log("\nInstall failed")
        //console.log(err)
      })
  })

program.parse(process.argv)
