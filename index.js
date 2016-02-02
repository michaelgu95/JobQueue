var kue = require('kue'),
	queue = kue.createQueue();
var express = require('express'),
	app = express();
var redis = require('redis'),
	client = redis.createClient();
var request = require('request');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var port = process.env.PORT || 3000;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

//ensure tests that require app don't listen twice
if(!module.parent){
	app.listen(port, function(err) {
	    if(err) throw err;        
	    console.log('Express server running on localhost:%d', port);
	});
}

app.get('/', function(req, res){
	if(req.param('id')){
		var id = req.param('id');
		console.log('User requests data with id: ' + id);
		//check if errors occurred in processing job
		client.hget("errors", id, function(err, value){
			if(err){
				res.send(err);
			//no errors occurred
			}else if(value == null){
				//get html stored in redis for the id
				client.hget("jobs", id, function(err, value){
					if(err){
						res.send(err);
					}else if(value == null){
						res.send('No value stored for job with id: ' + id + '\n');
						console.log('User requests invalid id');
					}else{
						res.json({html: value});
						console.log("Job complete with html: " + value);
					}
				})
			}else{
				res.send('Error occurred: ' + value + '\n');
			}
		});
	}
});

app.post('/', function(req, res){
	if(req.body.url){
		var url = req.body.url;
		newJob(res, url);
	}
});

function newJob(res, url){
	var job = queue.create('job', {
		url: url
	});

	job.on('complete', function(){
		console.log('Job', job.id, 'has finished');
		//send id as result
		res.setHeader('Content-Type', 'application/json');
		res.json({id: job.id});
	})
	.on('failed', function(){
		console.log('Job', job.id, 'has failed');
	});

	job.save();
}

queue.process('job', function (job, done){
	console.log('Job ' + job.id + ' is processsing...');
	var url = job.data.url.replace( /['"]/g, "" );
	console.log(url);

	//first make HEAD request to weed out large files(1 TB)
	var maxSize = Math.pow(10, 12); 
	var exceeded = false;
	request({
		url: url,
		method: "HEAD"
	}, function(err, head){
		if(!err){
			var size = head.headers['content-length'];
			if(size > maxSize){
				client.hset("errors", job.id, "Resource requested from URL exceeded maximum file size of 1 TB", function(err){
					done();
				});
				exceeded = true;
			}else{
				//content-length didn't exceed max -> start request
				scrapeURL(url, maxSize, job, done);
			}
		}else{
			//no header -> go ahead and start the request
			scrapeURL(url, maxSize, job, done);
		}	
	});
});

function scrapeURL(url, maxSize, job, done){
	//start request
	var req = request({
		url: url
	}, function(error, response, body){
		if(error){
			client.hset("errors", job.id, error.code, function(err){
				done();
			});
		}else{
			client.hset("jobs", job.id, body, function(err){
				done();
			});
		}
	});
	//continue to track incoming file size, in case header was wrong about size
	var size = 0;
	req.on('data', function(data){
		size += data.length;
		if(size > maxSize){
			console.log('Resource requested from URL exceeded maximum file size of 1 TB')
			client.hset("errors", job.id, "Resource requested from URL exceeded maximum file size of 1 TB", function(err){
				done();
			});
			req.abort();
		}
	});
}
