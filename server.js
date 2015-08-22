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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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




app.post("/:rideID?", function(req, resp){
				// Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
				var acc = {
					"x" : req.query.accX,
					"y" : req.query.accY,
					"z" : req.query.accZ,
					"timestamp" : req.query.timestamp
				};
				var geo = {
					"latitude"        : req.query.geoLatitude,
					"longitude"       : req.query.geoLongitude,
					"accuracy"        : req.query.geoAccuracy,
					"altitude"        : req.query.geoAltitude,
					"altitudeAccuracy": req.query.geoAltitudeAccuracy,
					"heading"         : req.query.geoHeading,
					"speed"           : req.query.geoSpeed
				};
				var comp = {
					"magneticHeading": req.query.compMagneticHeading,
					"trueHeading"    : req.query.compTrueHeading,
					"headingAccuracy": req.query.compHeadingAccuracy,
				};
				var rideID    = req.query.rideID;
        var tagID     = req.query.tagID;
				var version   = req.query.ver;

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
                          "tagID"    : tagID,
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
