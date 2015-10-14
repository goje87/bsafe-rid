
var http = require('http');
var mongoose = require('mongoose');
var request = require('request');
var Qs = require('qs');
var fs = require('fs');

// var rstats  = require('rstats');
// var R  = new rstats.session();
// var schemas = {
//   analysisData: require('./model/analysisData').schema,
// };
var analysisInprogress = false;

function analyzeFrame(rideId, frame){
  console.log("IN ANALYSIS FUNCTION");
  var timeAtEvent = frame[50].timestamp;
  var requestData = {
    'violationType': 'Speedbreaker',
    'geo': {
      'latitude': frame[50].geo.latitude,
      'longitude': frame[50].geo.longitude,
      'accuracy': frame[50].geo.accuracy,
      'altitude': frame[50].geo.altitude,
      'altitudeAccuracy': frame[50].geo.altitudeAccuracy,
      'heading': frame[50].geo.heading,
      'speed': frame[50].geo.speed*3.6,
    },
    'severity': 1,
    'description': "This is a speedbreaker"
  };
    return requestData;
};

function analyzeRide(){
  if(analysisInprogress){
    return;
  }
  analysisInprogress = true;
  var rideId;
  var getQuery = {
    'analyzed': 'false',
  };
    request.get({
      url:'http://localhost:3000/rideInfo',
      body: {'analyzed': 'false'},
      json: true
    },
    function(err,httpResponse,body){
    if(err){
      console.log(err);
    } else if(httpResponse.body.success == true && httpResponse.body.data.length > 0){
      rideId = httpResponse.body.data[0].rideId;
      var violations =[];
      //Check if ride JSON file exists in ./analysis/rideFiles
      fs.access('./analysis/rideFiles/' + rideId + '.json', fs.R_OK | fs.W_OK, function (err) {
        if(err){
          //If file does not exist. GET it from server and continue analysis.
          var requestURL = "http://localhost:3000/sensorData/" + rideId;
          var writeFile = request(requestURL).pipe(fs.createWriteStream("./analysis/rideFiles/" + rideId + ".json"));
          writeFile.on('finish', function(){
            continueAnalysis();
          });
        } else {
          //If file exists. Delete it and GET it again from server and continue analysis.
          fs.unlink('./analysis/rideFiles/' + rideId + '.json', function (err) {
            if (err) throw err;
            console.log('Deleted previously existing Ride file for this ride, and continuing analysis.');
          });
          var requestURL = "http://localhost:3000/sensorData/" + rideId;
          var writeFile = request(requestURL).pipe(fs.createWriteStream("./analysis/rideFiles/" + rideId + ".json"));
          writeFile.on('finish', function(){
            continueAnalysis();
          });
        }
      });

      function continueAnalysis(){
        var rideFile = require("./rideFiles/" + rideId + ".json");
        var analysisStartTime = Date.now();
        if(rideFile.data.length > 100){
          var count = 0;
          var frame = [];
          var frameLength = 100;
          var frameCenter = frameLength/2;
          var i =0;
          for(i=0; i<100; i++){
            frame[i]=rideFile.data[i];
          }
          while(i<(rideFile.data.length)){
            if((frame[frameCenter].geo.speed*3.6) <=10 && Math.abs(frame[frameCenter].acc.z > 1.8 )){
              console.log(++count);
              var result = analyzeFrame(rideId, frame);
              if(result){
                violations.push(result);
              }
            }else if((frame[frameCenter].geo.speed*3.6) <=15 && Math.abs(frame[frameCenter].acc.z > 2.4 )){
              console.log(++count);
              var result = analyzeFrame(rideId, frame);
              if(result){
                violations.push(result);
              }
            }else if((frame[frameCenter].geo.speed*3.6) <=20 && Math.abs(frame[frameCenter].acc.z > 3.1 )){
              console.log(++count);
              var result = analyzeFrame(rideId, frame);
              if(result){
                violations.push(result);
              }
            }else if((frame[frameCenter].geo.speed*3.6) <=25 && Math.abs(frame[frameCenter].acc.z > 4 )){
              console.log(++count);
              var result = analyzeFrame(rideId, frame);
              if(result){
                violations.push(result);
              }
            }else if((frame[frameCenter].geo.speed*3.6) > 25 && Math.abs(frame[frameCenter].acc.z > 4.7 )){
              console.log(++count);
              var result = analyzeFrame(rideId, frame);
              if(result){
                violations.push(result);
              }
            };
            frame.push(rideFile.data[i])
            frame.shift();
            i++;
          }
        }else {
          console.log("Ride is too short!");
          return;
        }
        var analysisEndTime = Date.now();
        var analysisInfo = JSON.stringify({
          'status': 'completed',
          'version': 1,
          'startedAt': analysisStartTime,
          'endedAt': analysisEndTime,
          'violations': violations
        });
        var putQuery = {
          'rideId': rideId,
          'analysisInfo': analysisInfo
        };
          request.put({
            url:'http://localhost:3000/rideInfo/' + rideId,
            body: putQuery,
            json: true
          },
          function(err,httpResponse,body){
            if(httpResponse.body.success == true){
              console.log("Succesfully updated for rideId" + httpResponse.body.rideId);
            } else {
              console.log("Failed to update ");
            }
          if(err){
            console.log(err);
          }
        });
      };
    }
  });
  analysisInprogress = false;
};

module.exports.analyzeRide = analyzeRide;
