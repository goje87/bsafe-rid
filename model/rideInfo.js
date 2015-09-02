var mongoose = require("mongoose");
var rideInfoSchema = new mongoose.Schema({
                  "rideId"            : Number,
                  "status"            : { type: String, enum: ["inprogress", "completed"] },
                  "startedAt"         : Number,
                  "endedAt"           : Number,
                  "analysisInfo"      : {
                    "status"          : { type: String, enum: ["inprogress", "completed", "pending"] },
                    "version"         : Number,
                    "startedAt"       : Number,
                    "endedAt"         : Number
                  }
});
mongoose.model("rideInfo", rideInfoSchema);
