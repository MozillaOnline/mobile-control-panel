/**
 * Module dependencies.
 */

var exec = require('child_process').exec;

/**
 * Add a shell command to the task queue.
 */
exports.schedule = function(cmdline){
  taskQueue.add(cmdline);
};

/**
 * Get the shell command running result.
 */
exports.getResult = function(){
  return {
    cmd: taskQueue.lastCmdline,
    error: taskQueue.errorCode,
    output: taskQueue.output
  };
};

var taskQueue = {
  _childProcess: null,
  _queue: [],
  lastCmdline: '',
  errorCode: 0,
  output: '',

  add: function(cmdline) {
    this.lastCmdline = cmdline;
    this.output = '[Waiting...]';
    this.errorCode = 0;
    this._queue.push(cmdline);
    if (!this._childProcess) {
      this._next();
    }
  },

  // Run next task
  _next: function() {
    var cmdline = this._queue.shift();
    this.lastCmdline = cmdline;
    this._childProcess = exec(cmdline, function(error, stdout, stderr) {
      // Get the results
      if (error) {
        console.log('exec "' + cmdline + '" error: ' + error);
      }
      this.errorCode = error ? error.code : 0;
      this.output = stdout;
      if (stderr != stdout) {
        this.output += '\n' + stderr;
      }
      this._childProcess = null;
      console.log(this.output);
      // Run next task
      if (this._queue.length > 0) {
        this._next();
      }
    }.bind(this));
  }
};
