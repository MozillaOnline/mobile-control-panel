/**
 * Module dependencies.
 */

var consoleService = require('../console_service');

/**
 * Schedule a shell command to run.
 *
 * @return If the command line is valid, returns {result: 'OK'}; Otherwise,
 * {result: 'InvalidCommand'}.
 */
exports.run = function(req, res){
  var cmdline = req.body.cmd || '';
  cmdline = cmdline.trim().replace(/\s+/g, ' ');
  if (cmdline) {
    consoleService.schedule(cmdline);
  }
  res.render('console_output', consoleService.getResult());
};

/**
 * Show the running result of the last task.
 */
exports.refresh = function(req, res){
  res.render('console_output', consoleService.getResult());
};
