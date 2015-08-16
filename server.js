var express    = require("express");
var router         = express.Router();
var http       = require('http');
var app        = express();
var db         = require("./model/db");
var rideDataDB = require("./model/rideDataDB");
var mongoose       = require("mongoose");
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));


app.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

//require("./router/crud.js")(app);

app.get("/:rideID?", function(req, res){
				mongoose.model('rideDataDB').find({ "rideID" : req.params.rideID }, function (err, result) {
			        if (err) {
								  res.status(404).send;
									console.log("ERRORED at GET /   , ");
			            return console.error(err);
			        } else {
									console.log("SUCCESS at GET /   , ");
                  console.log("Get results for RIDE ID =  " + req.params.rideID );
                  res.json({ "result" : result });
                  //res.render("index.html");
			        }
			  });

});



app.post("/", function(req, resp){
				// Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
				var acc = {
					"x" : req.body.acc.x,
					"y" : req.body.acc.y,
					"z" : req.body.acc.z,
					"timestamp" : req.body.acc.timestamp
				};
				var geo = {
					"latitude"        : req.body.geo.latitude,
					"longitude"       : req.body.geo.longitude,
					"accuracy"        : req.body.geo.accuracy,
					"altitude"        : req.body.geo.altitude,
					"altitudeAccuracy": req.body.geo.altitudeAccuracy,
					"heading"         : req.body.geo.heading,
					"speed"           : req.body.geo.speed
				};
				var comp = {
					"magneticHeading": req.body.comp.magneticHeading,
					"trueHeading"    : req.body.comp.trueHeading,
					"headingAccuracy": req.body.comp.headingAccuracy,
				};
				var rideID    = req.body.rideID;
				var version   = req.body.ver;

				mongoose.model('rideDataDB').create({
				                  "acc" : {
				                    "x" : acc.x,
				                    "y" : acc.y,
				                    "z" : acc.z,
				                    "timestamp" : acc.timestamp
				                  },
				                  "geo" : {
				                    "latitude"        : geo.latitude,
				                    "longitude"       : geo.longitude,
				                    "accuracy"        : geo.accuracy,
				                    "altitude"        : geo.altitude,
				                    "altitudeAccuracy": geo.altitudeAccuracy,
				                    "heading"         : geo.heading,
				                    "speed"           : geo.speed,
				                  },
				                  "comp" : {
				                    "magneticHeading" : comp.magneticHeading,
				                    "trueHeading"     : comp.trueHeading,
				                    "headingAccuracy" : comp.headingAccuracy,
				                  },
				                  "rideID"   : rideID,
				                  "version"  : version
				}, function (err, rideDataDB) {
							if (err) {
								  console.log("ERRORED at POST /   , " + err);
                  resp.send(422, { "result" : "failed" });
							} else {
									console.log("SUCCESS at POST /  ############################# ");
									console.log('POST creating new entry: ' + rideDataDB);
                  resp.send(201, { "result" : "success" });
							}
				});
})

var server = app.listen(3000, function(){
	console.log("Running on port 3000");
});
