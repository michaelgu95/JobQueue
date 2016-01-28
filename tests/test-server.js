process.env.NODE_ENV = 'test';
var chai = require('chai');
var expect = chai.expect;
var server = require('../index.js');
var request = require('request');


describe('JobQueue', function() {
	this.timeout(5000);
	it('should return HTML after GET w/ valid URL', function(done){
		request.get('http://localhost:3000/?url="http://www.google.com/"', function(err, res, body){
			var json = JSON.parse(body)
			expect(json).to.have.key('id');
			var id = json.id;
			var requestURL = 'http://localhost:3000/?id=' + id;
			request.get(requestURL, function(err, res, b){
				expect(JSON.parse(b)).to.have.key('html');
				done();
			});
		})
	})

	it('should return HTML after GET w/ secure URL', function(done){
		request.get('http://localhost:3000/?url="https://www.google.com/"', function(err, res, body){
			var json = JSON.parse(body)
			expect(json).to.have.key('id');
			var id = json.id;
			var requestURL = 'http://localhost:3000/?id=' + id;
			request.get(requestURL, function(err, res, b){
				expect(JSON.parse(b)).to.have.key('html');
				done();
			});
		})
	})

	it('should return a job id after GET w/ url that has arguments', function(done){
		request.get('http://localhost:3000/?url="https://www.foo.com/?a=b"', function(err, res, body){
			var json = JSON.parse(body)
			expect(json).to.have.key('id');
			var id = json.id;
			var requestURL = 'http://localhost:3000/?id=' + id;
			request.get(requestURL, function(err, res, b){
				expect(JSON.parse(b)).to.have.key('html');
				done();
			});
		})
	})

	it('should throw error:undefined after GET w/ invalid url', function(done){
		request.get('http://localhost:3000/?url="blahblahblah"', function(err, res, body){
			var json = JSON.parse(body);
			expect(json).to.have.key('id');
			var id = json.id;
			var requestURL = 'http://localhost:3000/?id=' + id;
			request.get(requestURL, function(err, res, body){
				expect(body).to.be.equal('Error occurred: undefined\n');
				done();
			});
		})	
	})
});