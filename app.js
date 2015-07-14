#!/usr/bin/env node

var cp = require('child_process')
var exec = cp.exec

var program = require('commander');

program
  .version('0.0.1')
  .command('install [name]')
  .action(function(pkg){
  	exec("tsd query "+pkg, function(err, out){
  		if(err){
  			console.log("please run: npm install tsd -g")
  		}else{
  			var numberOfResults = (out.match(/-/g)||[]).length
  			if(numberOfResults != 1){
  				console.log("tsd package not found")
  			}else{
  				var cmd = "tsd install "+pkg+" --save";
  				console.log(cmd)
  				exec(cmd, function(err, out){
  					console.log("complete.")
  					var cmd = "npm install "+pkg+" --save"
  					console.log(cmd)
  					exec(cmd, function(err, out){
  						if(err){
  							console.log("npm package not found")
  						}else{
  							console.log(out)
  							console.log("complete.")
  						}
  					})
  				})
  			}
  		}
  	})
  })
  //.option('-s, --save', 'save to tsd and package.json file')

program.parse(process.argv);

//console.log(program.command)