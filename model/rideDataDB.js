var mongoose = require("mongoose");
var rideDataDBSchema = new mongoose.Schema({
                  "acc": {
                    "x" : Number,
                    "y" : Number,
                    "z" : Number,
                    "timestamp" : Date
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
                  "rideID"   : Number,
                  "version"  : Number
});
mongoose.model("rideDataDB", rideDataDBSchema);
