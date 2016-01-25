var kue = require('kue');
var http = require('http');
var express = require('express');
var request = require('request');
var redis = require('redis');
var client = redis.createClient();
var app = express();
var queue = kue.createQueue();


app.get('/', function(req, res){
	//if user GETs with an id
	if(req.id){
		//if the job was completed
		if(responses.indexOf(req.id) > -1){
			client.hget("jobs", job.id, function(err, value){
				if(err){
					console.log(err);
				}else{
					console.log("job complete with value: " + value);
				}
			})
		}
	//otherwise, create new job and return job.id
	}else{
		var id = newJob();
		res.send(id);
	}
})

var responses = [];

function newJob(){
	var job = queue.create('new_job');

	job.on('complete', function(){
		console.log('Job', job.id, 'has finished');
		responses.push(job.id);
	})
	.on('failed', function(){
		console.log('Job', job.id, 'has failed');
	});

	job.save();
	return job.id;
}

queue.process('new_job', function (job, done){
	request("http://www.google.com/", function(error, response, body){
		if(!error){
			client.hset("jobs", job.id, body);
			done();
		}else{
			console.log(error);
		}
	})
})

setInterval(function(){
	newJob();
}, 3000);