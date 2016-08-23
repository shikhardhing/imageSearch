var express = require('express')
var http = require('http')
var request = require('request')
var moment = require('moment')
var app = express()

var mongoose = require('mongoose')
//var url = 'mongodb://localhost:27017/imgsearch'
var url="mongodb://shikhar97:(xyz123)@ds145315.mlab.com:45315/qwerty";
mongoose.connect(url)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
	console.log("connected")
})
var schemas=mongoose.Schema({
	query: String,
	time:Date
})
var searchTable=mongoose.model('schemas',schemas)

app.get('/searches',function(req,res){
	searchTable.find({},function(err,result){
		if(err) throw err
		res.send(result)
	})
})

app.get('/:query', function (req, res) {
	var options = {
		method: 'GET',
		url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q='+req.params.query+'&mkt=en-us',
		headers: {
			'Ocp-Apim-Subscription-Key':'cf10e0ade91a43a79dd75351c73a5a6c'
		}
	};
	request(options,function(error, response, body) {
		if(error) throw error;
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			var to='[';
			console.log(info.value.length);
			
			record=new searchTable ({query:req.params.query,time:moment().format()})
			record.save(function(err){
				if(err) throw err
				console.log("saved")
			})
			for (var i = 0; i < info.value.length-1; i++) {
				to+='{"url":"'+info.value[i].contentUrl+'","snippet":"'+info.value[i].name+'","thumbnail":"'+info.value[i].thumbnailUrl+'"},';
			}
			to+='{"url":"'+info.value[i].contentUrl+'","snippet":"'+info.value[i].name+'","thumbnail":"'+info.value[i].thumbnailUrl+'"}]';
			res.json(JSON.parse(to));
		   }
	})
})
app.set('port',(process.env.PORT||8001))
var server = app.listen(app.get('port'), function () {
	var host = 'localhost'
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
});