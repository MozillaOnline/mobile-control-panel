var express = require('express');
var fs = require('fs');

var app = express();
app.set('views',__dirname+'/public');
app.set('view engine','jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname+'/static'));
var routes = JSON.parse(fs.readFileSync('router.json','utf-8'));
var contains = {contains: {rightDisplay: 'this is a test this is a test\n'}};
var startRouter = function(path){
	app.get(route, function(req,res){
		console.log(path);
		if(path =='/zh-CN'){
			//var exec = require('child_process').exec,
				//last = exec('make -f client.mk',{cwd:"/home/cewang/fennec/gecko"});
			//last.stdout.on('data',function (data) {
			//	console.log(data);
			//	contains = {contains: {rightDisplay: data}};
			//});
			//contains = {contains: {rightDisplay: 'now in zh-CN link'}};
		}else {
			contains = {contains: {rightDisplay: 'this is a test'}};
		}
		res.render(routes[path].template, contains);
	});
}
for(route in routes){
	startRouter(route);
}

try{
	app.listen(3000);
	console.log("Express server listening on port 3000");
}catch(e){
	console.log("Error: " + e.message,1);
}
