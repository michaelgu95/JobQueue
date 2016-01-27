var kue = require('kue'),
	queue = kue.createQueue();
var express = require('express'),
	app = express();
var redis = require('redis'),
	client = redis.createClient();
var request = require('request');

var port = process.env.PORT || 3000;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

app.listen(port, function(err) {
   if(err) throw err;        
   console.log('Express server running on localhost:%d', port);
});

app.get('/', function(req, res){
	//if user GETs with an id
	if(req.param('id')){
		var id = req.param('id');
		console.log('User requests data with id: ' + id);
		//get html stored in redis for the id
		client.hget("jobs", id, function(err, value){
			if(err){
				res.send(err);
			}else if(value == null){
				res.send('No value stored for id: ' + id + '\n');
				console.log('User requests invalid id');
			}else{
				res.send(value);
				console.log("Job complete with value:" + value);
			}
		})
		
	//otherwise, create new job
	}else if(req.param('url')){
		newJob(res, req.param('url'));
	}
})

function newJob(res, url){
	var job = queue.create('new_job', {
		url: url
	});
	job.on('complete', function(){
		console.log('Job', job.id, 'has finished');

		//send id as result
		res.setHeader('Content-Type', 'application/json');
		res.send('Your job id: ' + job.id + '\n');
	})
	.on('failed', function(){
		console.log('Job', job.id, 'has failed');
	});

	job.save();
}

queue.process('new_job', function (job, done){
	var url = job.data.url.replace( /['"]/g, "" );
	request(url, function(error, response, body){
		if(!error){
			client.hset("jobs", job.id, body);
			done();
		}else{
			console.log(error);
		}
	})
})