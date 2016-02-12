# JobQueue
Job Queue that fetches HTML requests from a specified url

##Fire it up
1. Install packages
2. Run redis server 
3. Run express server
4. POST call to API with url to scrape(ex:google)
    - note the job id returned from call
5. Run another cURL command using the job id from first call: $ curl -i -X  GET 'http://localhost:3000/?id=(insert job id here)'




