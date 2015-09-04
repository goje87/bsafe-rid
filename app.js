var express        = require("express");
var router         = express.Router();
var http           = require('http');
var app            = express();
var db             = require("./model/db");
var sensorData     = require("./model/sensorData");
var rideInfo       = require("./model/rideInfo");
var mongoose       = require("mongoose");
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
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

function normalise(obj) {
	for(var i in obj) {
		if(obj.hasOwnProperty(i)) {
      switch(typeof obj[i]) {
        case 'undefined':
          obj[i] = null;
        break;
        case 'string':
          if((obj[i].toLowerCase() == "undefined") || (obj[i].toLowerCase() == "null")){
            obj[i] = null;
          }
        break;
        }

		}
	}
	return obj;
}

app.get("/sensorData/:rideId/:tagId?", function(req, res){
				mongoose.model('sensorData').find({ "rideId" : req.params.rideId, "tagId" : req.params.tagId }, function (err, result) {
			        if (err) {
								  //res.status(404).send;
                  res.send(404, { "success" : false, error : { "message" : err } });
                  console.log("ERRORED at GET /   , ");
			            return console.error(err);
			        } else {
									console.log("SUCCESS at GET /   , for collection : sensorData");
                  console.log("Get results for RIDE ID =  " + req.params.rideId );
                  res.send(200, { "success" : true, "data" : result });
                  //res.json({ "success" : true, "data" : result });
                  //res.render("index.html");
			        }
			  });

});


app.get("/rideInfo/:rideId", function(req, res){
				mongoose.model('rideInfo').find({ "rideId" : req.params.rideId }, function (err, result) {
			        if (err) {
								  //res.status(404).send;
                  res.send(404, { "success" : false, error : { "message" : err } });
									console.log("ERRORED at GET /   , ");
			            return console.error(err);
			        } else {
									console.log("SUCCESS at GET /   , for collection : rideInfo");
                  console.log("Get results for RIDE ID =  " + req.params.rideId );
                  res.send(200, { "success" : true, "data" : result });
                  //res.json({ "success" : true, "data" : result });
                  //res.render("index.html");
			        }
			  });

});




app.post("/sensorData", function(req, resp){
				// Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var acc = normalise({
					"x" : req.query.accX,
					"y" : req.query.accY,
					"z" : req.query.accZ,
				});
				var geo = normalise({
					"latitude"        : req.query.geoLatitude,
					"longitude"       : req.query.geoLongitude,
					"accuracy"        : req.query.geoAccuracy,
					"altitude"        : req.query.geoAltitude,
					"altitudeAccuracy": req.query.geoAltitudeAccuracy,
					"heading"         : req.query.geoHeading,
					"speed"           : req.query.geoSpeed
				});
				var comp = normalise({
					"magneticHeading": req.query.compMagneticHeading,
					"trueHeading"    : req.query.compTrueHeading,
					"headingAccuracy": req.query.compHeadingAccuracy,
				});
        var timestamp = req.query.timestamp;
				var rideId    = req.query.rideId;
        var tagId     = req.query.tagId;
				var version   = req.query.ver;

				mongoose.model('sensorData').create({
				                  "acc" : {
				                    "x" : acc.x,
				                    "y" : acc.y,
				                    "z" : acc.z,
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
                          "timestamp" : timestamp,
				                  "rideId"   : rideId,
                          "tagId"    : tagId,
				                  "version"  : version
				}, function (err, sensorData) {
							if (err) {
								  console.log("ERRORED at POST /   , " + err);
                  resp.send(422, { "success" : false, error : { "message" : err } });
							} else {
									console.log("SUCCESS at POST /  for collection sensorData ############################# ");
									console.log('POST creating new entry: ' + sensorData);
                  resp.send(201, { "success" : true, "data" : sensorData });
							}
				});
})



app.post("/rideInfo", function(req, resp){

    if(req.query.rideId && req.query.startedAt){
        var rideStatus;
        if(req.query.status){
          rideStatus = req.query.status;
        } else {
          rideStatus = "inprogress";
        }

        if(req.query.analysisStatus){
          analysisStatus = req.query.analysisStatus;
        } else {
          analysisStatus = "pending";
        }

				mongoose.model('rideInfo').create({
          "rideId"            : req.query.rideId,
          "status"            : rideStatus,
          "startedAt"         : req.query.startedAt,
          "endedAt"           : req.query.endedAt,
          "analysisInfo"      : normalise({
            "status"          : analysisStatus,
            "version"         : req.query.analysisVersion,
            "startedAt"       : req.query.analysisStartedAt,
            "endedAt"         : req.query.analysisEndedAt
          })
				}, function (err, rideInfo) {
							if (err) {
								  console.log("ERRORED at POST /   , " + err);
                  resp.send(422, { "success" : false, error : { "message" : err }});
							} else {
									console.log("SUCCESS at POST /  for collection rideInfo ############################# ");
									console.log('POST creating new entry: ' + rideInfo);
                  resp.send(201, { "success" : true, "data" : rideInfo});
							}
				});
        return ;
      }
      resp.send(422, { "success" : false, error : { "message" : "Both rideId and startedAt are REQUIRED" } });
})

app.put("/rideInfo/:rideId", function(req, resp){

    if(req.params.rideId){
      var updateFields = {};
      for(var i in req.query){
        updateFields[i] = req.query[i];
      }

				mongoose.model('rideInfo').findOneAndUpdate({ rideId : req.params.rideId}, updateFields, { new : true}, function (err, rideInfo) {
							if (err) {
								  console.log("ERRORED at PUT /   , " + err);
                  resp.send(422, { "success" : false, error : { "message" : err }});
							} else {
									console.log("SUCCESS at PUT /  for collection rideInfo ############################# ");
									console.log('PUT updating entry: ' + rideInfo);
                  resp.send(201, { "success" : true, "data" : rideInfo});
							}
				});
        return ;
      }
      resp.send(422, { "success" : false, error : { "message" : "rideId is REQUIRED for PUT operation" } });
})


var server = app.listen(3000, function(){
	console.log("Running on port 3000");
});
