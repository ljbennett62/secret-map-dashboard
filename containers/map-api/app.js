const express = require("express");
const app = express();
const mongoose = require("mongoose");
const assert = require("assert");
const fs = require("fs");
const cors = require("cors");

const beaconRoute = require("./routes/beacons");
const boothRoute = require("./routes/booths");
const eventRoute = require("./routes/events");
const svgRoute = require("./routes/svg");

const mongoDbUrl = process.env.MONGODB_URL;

let ca;
if (process.env.MONGODB_CERT_BASE64) {
  ca = new Buffer(process.env.MONGODB_CERT_BASE64, "base64");
} else {
  ca = [fs.readFileSync("/etc/ssl/mongo.cert")];
}

let mongoDbOptions = {
  mongos: {
    useMongoClient: true,
    ssl: true,
    sslValidate: true,
    sslCA: ca,
  },
};

mongoose.connection.on("error", function(err) {
  console.log("Mongoose default connection error: " + err);
});

mongoose.connection.on("open", function(err) {
  console.log("CONNECTED...");
  assert.equal(null, err);
});

mongoose.connect(mongoDbUrl, mongoDbOptions);

app.use(require("body-parser").json());
app.use(cors());

app.use(express.static(__dirname + "/public"));

app.use("/beacons", beaconRoute);
app.use("/booths", boothRoute);
app.use("/events", eventRoute);
app.use("/svg", svgRoute);

let port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
