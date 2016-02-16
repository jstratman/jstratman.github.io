var exec = require('child_process').exec,
    child, child2;

 var playgrounds;   

 child = exec('query-overpass queries/playground_center.ql', {maxBuffer: 1024 * 2500},
 function (error, stdout, stderr) {
     console.log('stdout: ' + stdout);
     console.log('stderr: ' + stderr);
     if (error !== null) {
          console.log('exec error: ' + error);
     }
 });

  child2 = exec('query-overpass queries/playground_poly.ql', {maxBuffer: 1024 * 2500},
 function (error, stdout, stderr) {
 	playgrounds = stdout;
     console.log('stdout: ' + playgrounds);
     console.log('stderr: ' + stderr);
     if (error !== null) {
          console.log('exec error: ' + error);
     }
 });