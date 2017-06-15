/*
 * Cron Job to get real time weather data
 */

var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var cron = require('node-cron');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
  output: process.stdout
});
var reqString = '';

var insertDocument = function(db, cityname, temperature, callback) {
   db.collection('weather').insertOne( {
      "city" : cityname,
	  "temperature": temperature
   }, function(err, result) {
       if(err){
		   throw err;
	   }
    console.log("Inserted a document into the Weather collection.");
    callback();
  });
};


MongoClient.connect('mongodb://localhost:27017/Temp', function(err,db){
	if(err){
		   throw err;
	   }
		
	rl.question('Enter a city ', (answer) => {
		reqString = "http://api.openweathermap.org/data/2.5/weather?q="+answer+"&appid=c7bc2d344097639fdb583c7420c869ff&units=imperial";
	});
	
  
  	var task = cron.schedule('* * * * *', function(){
		var body = '';
		
		console.log(reqString);
		var req = request(reqString,{json:true});	
		
		req.on('error',function(err) {	
			throw err;
		});
			
		req.on('data',function(chunk) {	
			body += chunk;
		});
		req.on('response',function(res) {
			if (res.statusCode != 200) {
				console.log("ERROR");
			} 
		});
		req.on('end', function(){
			var obj = JSON.parse(body);
			console.log("Temp in "+obj.name+ " is " + obj.main.temp );
			insertDocument(db, obj.name, obj.main.temp, function() {
				//db.close();
			});
		});
			
		console.log('running a task every minute');
	});
	
	task.start();
	
});
		
	
