
module.exports.schema = {
  'rideId': Number,
  'userId': String,
  'title': String,
  'status': { type: String, enum: ['inprogress', 'completed'] },
  'startedAt': Number,
  'endedAt': Number,
  'analysisInfo': {
    'status': { type: String, enum: ['inprogress', 'completed', 'pending'] },
    'version': Number,
    'startedAt': Number,
    'endedAt': Number,
    'violations': [{
      'violationType': String,
      'geo': {
        'latitude': Number,
        'longitude': Number,
        'accuracy': Number,
        'altitude': Number,
        'altitudeAccuracy': Number,
        'heading': Number,
        'speed': Number,
      },
      'severity': Number,
      'description': String
    }]
  }
};
