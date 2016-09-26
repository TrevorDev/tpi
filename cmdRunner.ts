import cp = require('child_process')
let exec = cp.exec

// CMD RUNNER
export default class CmdRunner {
    private childProcess: cp.ChildProcess
    constructor(public cmd: string, public options?) {
      if(!this.options){
        this.options = {}
      }
    }
    run(){
        return new Promise((resolve, reject) => {
          if(this.childProcess){
            //already started
            resolve(false)
            return
          }
          if(this.options.onStart){
            this.options.onStart(this)
          }
          this.childProcess = exec(this.cmd, function(err, out){
            if(err){
              reject(err)
            }else{
              resolve(out)
            }
          })
          this.childProcess.stdout.on('data', (data) => {
            if(this.options.onStdOut){
              this.options.onStdOut(data.toString())
            }
          });
          this.childProcess.stderr.on('data', (data) => {
            if(this.options.onStdErr){
              this.options.onStdErr(data.toString())
            }
          });
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
