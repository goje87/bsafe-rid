var mongoose = require("mongoose");
var sensorDataSchema = new mongoose.Schema({
                  "acc": {
                    "x" : Number,
                    "y" : Number,
                    "z" : Number,
                  },
                  "geo" : {
                    "latitude"        : Number,
                    "longitude"       : Number,
                    "accuracy"        : Number,
                    "altitude"        : Number,
                    "altitudeAccuracy": Number,
                    "heading"         : Number,
                    "speed"           : Number,
                  },
                  "comp" : {
                    "magneticHeading": Number,
                    "trueHeading"    : Number,
                    "headingAccuracy": Number,
                  },
                  "timestamp" : Number,
                  "rideId"    : Number,
                  "tagId"     : Number,
                  "version"   : Number
});
mongoose.model("sensorData", sensorDataSchema);
