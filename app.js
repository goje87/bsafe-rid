'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var schemas = {
  rideInfo: require('./model/rideInfo').schema,
  sensorData: require('./model/sensorData').schema
};

mongoose.connect('mongodb://localhost/bsafe_rid');

for(var i in schemas) {
  var schema = new mongoose.Schema(schemas[i]);
  mongoose.model(i, schema);
}


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

app.use(bodyParser.json({ extended: true }));

app.use(methodOverride(function(req){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

function normalise(obj) {
  for(var i in obj) {
    if(obj.hasOwnProperty(i)) {
      switch(typeof obj[i]) {
      case 'undefined':
        obj[i] = null;
        break;
      case 'string':
        if((obj[i].toLowerCase() == 'undefined') || (obj[i].toLowerCase() == 'null')){
          obj[i] = null;
        }
        break;
      }
    }
  }
  return obj;
}

app.get('/sensorData/:rideId/:tagId?', function(req, res, next){
  if(req.params.tagId){
    var stream = mongoose.model('sensorData').find({ 'rideId': req.params.rideId, 'tagId': req.params.tagId }).stream();
  } else {
    var stream = mongoose.model('sensorData').find({ 'rideId': req.params.rideId }).stream();
  }

  var isFirstDoc = true;

  res.write(' { "success": true, "data": [');
  stream.on('data', function (doc) {
    res.write((isFirstDoc ? '' : ',')+JSON.stringify(doc));
    isFirstDoc = false;
  });
  stream.on('error', function (err) {
      return next(err);
  });
  stream.on('close', function () {
    res.write(']}');
    res.end();
  });

  // mongoose.model('sensorData').find({ 'rideId': req.params.rideId, 'tagId': req.params.tagId }, function (err, result) {
  //   if (err) {
  //     res.send(404, { 'success': false, error: { 'message': err } });
  //     console.log('ERRORED at GET /   , ');
  //     return console.error(err);
  //   }
  //   else {
  //     console.log('SUCCESS at GET /   , for collection: sensorData');
  //     console.log('Get results for RIDE ID =  ' + req.params.rideId );
  //     res.send(200, { 'success': true, 'data': result });
  //     result = null;
  //   }
  // });

});


app.get('/rideInfo/:rideId', function(req, res){
  mongoose.model('rideInfo').find({ 'rideId': req.params.rideId }, function (err, result) {
    if (err) {
      res.send(404, { 'success': false, error: { 'message': err } });
      console.log('ERRORED at GET /   , ');
      return console.error(err);
    }
    else {
      console.log('SUCCESS at GET /   , for collection: rideInfo');
      console.log('Get results for RIDE ID =  ' + req.params.rideId );
      res.send(200, { 'success': true, 'data': result });
      result = null;
    }
  });
});


app.get('/rideInfo', function(req, res, next){
  // To GET all rides by "userId"
  if(req.query.userId){
    var stream = mongoose.model('rideInfo').find({ 'userId': req.query.userId }).stream();
    var isFirstDoc = true;
    res.write(' { "success": true, "data": [');
    stream.on('data', function (doc) {
      res.write((isFirstDoc ? '' : ',')+JSON.stringify(doc));
      isFirstDoc = false;
    });
    stream.on('error', function (err) {
        return next(err);
    });
    stream.on('close', function () {
      res.write(']}');
      res.end();
    });
  };
  if(req.body.analyzed === 'false'){
    var stream = mongoose.model('rideInfo').find({ 'endedAt': { $exists: true },'status': 'completed', 'analysisInfo.status': 'pending' }).stream();
    var isFirstDoc = true;
    res.write(' { "success": true, "data": [');
    stream.on('data', function (doc) {
      console.log(doc)
      res.write((isFirstDoc ? '' : ',')+JSON.stringify(doc));
      isFirstDoc = false;
    });
    stream.on('error', function (err) {
        return next(err);
    });
    stream.on('close', function () {
      res.write(']}');
      res.end();
    });
  }
});


app.post('/sensorData', function(req, resp){
  // Get values from POST request. These can be done through forms or REST calls. These rely on the 'name' attributes for forms
  var acc = normalise({
    'x': req.body.accX,
    'y': req.body.accY,
    'z': req.body.accZ
  });
  var geo = normalise({
    'latitude': req.body.geoLatitude,
    'longitude': req.body.geoLongitude,
    'accuracy': req.body.geoAccuracy,
    'altitude': req.body.geoAltitude,
    'altitudeAccuracy': req.body.geoAltitudeAccuracy,
    'heading': req.body.geoHeading,
    'speed': req.body.geoSpeed
  });
  var comp = normalise({
    'magneticHeading': req.body.compMagneticHeading,
    'trueHeading': req.body.compTrueHeading,
    'headingAccuracy': req.body.compHeadingAccuracy
  });
  var timestamp = req.body.timestamp;
  var rideId    = req.body.rideId;
  var tagId     = req.body.tagId;
  var version   = req.body.ver;

  mongoose.model('sensorData').create({
    'acc': {
      'x': acc.x,
      'y': acc.y,
      'z': acc.z
    },
    'geo': {
      'latitude': geo.latitude,
      'longitude': geo.longitude,
      'accuracy': geo.accuracy,
      'altitude': geo.altitude,
      'altitudeAccuracy': geo.altitudeAccuracy,
      'heading': geo.heading,
      'speed': geo.speed
    },
    'comp': {
      'magneticHeading': comp.magneticHeading,
      'trueHeading': comp.trueHeading,
      'headingAccuracy': comp.headingAccuracy
    },
    'timestamp': timestamp,
    'rideId': rideId,
    'tagId': tagId,
    'version': version
  }, function (err, sensorData) {
    if(err) {
      console.log('ERRORED at POST /   , ' + err);
      resp.send(422, { 'success': false, error: { 'message': err } });
    }
    else {
      console.log('SUCCESS at POST /  for collection sensorData ############################# ');
      console.log('POST creating new entry: ' + sensorData);
      resp.send(201, { 'success': true, 'data': sensorData });
      sensorData = null;
    }
  });
});



app.post('/rideInfo', function(req, resp){

  if(req.body.rideId && req.body.userId && req.body.startedAt){
    var rideStatus, analysisStatus;

    if(req.body.status){
      rideStatus = req.body.status;
    }
    else {
      rideStatus = 'inprogress';
    }

    if(req.body.analysisStatus){
      analysisStatus = req.body.analysisStatus;
    }
    else {
      analysisStatus = 'pending';
    }

    mongoose.model('rideInfo').create({
      'rideId': req.body.rideId,
      'title': req.body.title,
      'userId': req.body.userId,
      'status': rideStatus,
      'startedAt': req.body.startedAt,
      'endedAt': req.body.endedAt,
      'analysisInfo': normalise({
        'status': analysisStatus,
        'version': req.body.analysisVersion,
        'startedAt': req.body.analysisStartedAt,
        'endedAt': req.body.analysisEndedAt
      })
    }, function (err, rideInfo) {
      if (err) {
        console.log('ERRORED at POST /   , ' + err);
        resp.send(422, { 'success': false, error: { 'message': err }});
      }
      else {
        console.log('SUCCESS at POST /  for collection rideInfo ############################# ');
        console.log('POST creating new entry: ' + rideInfo);
        resp.send(201, { 'success': true, 'data': rideInfo});
        rideInfo = null;
      }
    });
    return ;
  }
  resp.send(422, { 'success': false, error: { 'message': 'Both rideId, userId and startedAt are REQUIRED' } });
});

app.put('/rideInfo/:rideId', function(req, resp){
  if(req.params.rideId) {
    var updateFields = {};
    for(var i in req.body){
      if(i==='analysisInfo'){
        updateFields[i] = JSON.parse(req.body[i]);
      }else{
        updateFields[i] = req.body[i];
      }
    };

    mongoose.model('rideInfo').findOneAndUpdate({ rideId: req.params.rideId}, updateFields, { new: true}, function (err, rideInfo) {
      if (err) {
        console.log('ERRORED at PUT /   , ' + err);
        resp.send(422, { 'success': false, error: { 'message': err }});
      } else {
        console.log('SUCCESS at PUT /  for collection rideInfo ############################# ');
        console.log('PUT updating entry: ' + rideInfo);
        resp.send(201, { 'success': true, 'data': rideInfo});
        rideInfo = null;
      }
    });
    return ;
  }
  resp.send(422, { 'success': false, error: { 'message': 'rideId is REQUIRED for PUT operation' } });
});


app.listen(3000, function(){
  console.log('Running on port 3000');
});

var analysis = require('./analysis/analysis');
setInterval(function() {
  analysis.analyzeRide();
}, 5000);
