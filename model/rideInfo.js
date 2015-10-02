
module.exports.schema = {
  'rideId': Number,
  'userId': String,
  'status': { type: String, enum: ['inprogress', 'completed'] },
  'startedAt': Number,
  'endedAt': Number,
  'analysisInfo': {
    'status': { type: String, enum: ['inprogress', 'completed', 'pending'] },
    'version': Number,
    'startedAt': Number,
    'endedAt': Number
  }
};
