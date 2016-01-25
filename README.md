# JobQueue
Job Queue that fetches HTML requests from http://google.com/

##Fire it up
1. Install packages: $ npm install
2. Run redis server using: $ src/redis-server
3. Run express server: $ node index.js
4. Run a cURL command to root of API : $ curl -i -X  GET 'http://localhost:3000/'
    - note the job id returned from call
5. Run another cURL command using the job id from first call: $ curl -i -X  GET 'http://localhost:3000/?id=(insert job id here)'




