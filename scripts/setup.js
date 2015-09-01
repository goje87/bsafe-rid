var MongoClient = require('mongodb').MongoClient;
var collectionName = ["sensorData", "rideInfo"]; // Add new collections to this array

collectionName.forEach(function (collectionName){
MongoClient.connect('mongodb://localhost:27017/bsafe_rid', function(err, db) {
  if(err){
    console.log("FAILED to connect to DB");
  }
  // Grab a collection with a callback in safe mode, ensuring it exists (should fail if it doesnt)
  db.collection(collectionName, {strict:true}, function(err, col3) {
    if(err){
        //console.log(err);
        console.log("Collection " + collectionName + " DOES NOT EXIST ...  Creating...");
        // Create the collection
        db.createCollection(collectionName, function(err, result) {
          if(err != null){
          console.log(err);
          }
          console.log("Done creating collection." + collectionName);
          // Retry to get the collection.
          db.collection(collectionName, {strict:true}, function(err, col3) {
          if(err){
            console.log("Unable to get collection" + collectionName);
          }
            db.close();
          });
        });
    } else {
    console.log("Collection " + collectionName + " already EXISTS");
    db.close();
    }
  });
});
})
