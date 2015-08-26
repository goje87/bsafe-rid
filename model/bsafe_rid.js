var mongoose = require("mongoose");
var bsafe_ridSchema = new mongoose.Schema({
                  "acc": {
                    "x" : Number,
                    "y" : Number,
                    "z" : Number,
                    "timestamp" : Number
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
                  "rideId"   : Number,
                  "tagId"    : Number,
                  "version"  : Number
});
mongoose.model("bsafe_rid", bsafe_ridSchema);
