process.env.NODE_ENV = 'test';
var chai = require('chai');
chai.use(require('chai-string'));
var expect = chai.expect;
var server = require('../index.js');
var request = require('request');


describe('JobQueue', function() {
	this.timeout(5000);
	var options = {
  		uri: 'http://localhost:3000',
  		method: 'POST'
	};
	
	it('should return HTML after request w/ valid URL', function(done){
		options.json = {url: "http://www.google.com/"};
		request(options, function(err, res, body){
			expect(body).to.have.key('id');
			var id = body.id;
			var requestURL = 'http://localhost:3000/?id=' + id;
			request.get(requestURL, function(err, res, b){
				json = JSON.parse(b);
				expect(json).to.have.key('html');
				expect(json.html).to.match(/(.*?)html>(.*?)/);
				done();
			});
		})
	})

	it('should return HTML after request w/ secure URL', function(done){
		options.json = {url: "https://www.google.com/"};
		request(options, function(err, res, body){
			expect(body).to.have.key('id');
			var id = body.id;
			var requestURL = 'http://localhost:3000/?id=' + id;
			request.get(requestURL, function(err, res, b){
				json = JSON.parse(b);
				expect(json).to.have.key('html');
				expect(json.html).to.match(/(.*?)html>(.*?)/);
				done();
			});
		})
	})

	it('should return a job id after request w/ url that has arguments', function(done){
		options.json = {url: "https://www.foo.com/?a=b"};
		request(options, function(err, res, body){
			expect(body).to.have.key('id');
			var id = body.id;
			var requestURL = 'http://localhost:3000/?id=' + id;
			request.get(requestURL, function(err, res, b){
				json = JSON.parse(b);
				expect(json).to.have.key('html');
				expect(json.html).to.match(/(.*?)html>(.*?)/);
				done();
			});
		})
	})

	it('should throw error:undefined after GET w/ invalid url', function(done){
		options.json = {url: "blablahblah"};
		request(options, function(err, res, body){
			expect(body).to.have.key('id');
			var id = body.id;
			var requestURL = 'http://localhost:3000/?id=' + id;
			request.get(requestURL, function(err, res, body){
				expect(body).to.be.equal('Error occurred: undefined\n');
				done();
			});
		})	
	})
});