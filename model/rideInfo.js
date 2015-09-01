var mongoose = require("mongoose");
var rideInfoSchema = new mongoose.Schema({
                  "rideId"            : Number,
                  "status"            : String,
                  "startedAt"         : Number,
                  "endedAt"           : Number,
                  "analysisInfo"      : {
                    "status"          : String,
                    "version"         : Number,
                    "startedAt"       : Number,
                    "endedAt"         : Number
                  }
});
mongoose.model("rideInfo", rideInfoSchema);
