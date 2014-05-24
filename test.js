require('child_process').exec("/bin/bash /usr/bin/reset-spacewars.sh", function(error, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
});