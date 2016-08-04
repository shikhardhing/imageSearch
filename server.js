var express = require('express');
var http = require('http');
var request = require('request');
var mysql = require('mysql');
var moment = require('moment');
var app = express();
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'shikhar',
  password : 'password',
  database : 'myDB'
});
connection.connect();

app.get('/searches',function(req,res){
	connection.query('SELECT * FROM imgsearchtable', function(err, rows, fields) {
		if (err) throw err;
		res.send(rows);
	});
});

app.get('/:query', function (req, res) {
	var options = {
		method: 'GET',
		url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q='+req.params.query+'&mkt=en-us',
		headers: {
			'Ocp-Apim-Subscription-Key':'cf10e0ade91a43a79dd75351c73a5a6c'
		}
	};
	request(options,function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			var to='[';
			console.log(info.value.length);
			connection.query('INSERT INTO imgsearchtable VALUES("'+req.params.query+'","'+moment().format()+'");', function(err, rows, fields) {
			  	if (err) throw err;
			  	console.log('Inserted');
			});
			for (var i = 0; i < info.value.length-1; i++) {
				to+='{"url":"'+info.value[i].contentUrl+'","snippet":"'+info.value[i].name+'","thumbnail":"'+info.value[i].thumbnailUrl+'"},';
			}
			to+='{"url":"'+info.value[i].contentUrl+'","snippet":"'+info.value[i].name+'","thumbnail":"'+info.value[i].thumbnailUrl+'"}]';
			res.json(JSON.parse(to));
		   }
	});
	//res.send('Hello World');
});

var server = app.listen(8081, function () {
var host = 'localhost'
var port = server.address().port
console.log("Example app listening at http://%s:%s", host, port)
});
// HTTP/1.1