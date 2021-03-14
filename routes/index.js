const express = require("express");
const router = express.Router();
const myDB = require("../db/MyDB.js");


//<-----------add handler for POST and store in db-------->
/*eslint no-unused-vars: ["error", { "args": "none" }]*/
router.post("/report", (req, res) => {
  var date = req.body.date;
  var event = req.body.event;
  var address = req.body.address;

  var data = {
    date: date,
    event: event,
    address: address,
  };

  const MongoClient = require("mongodb").MongoClient;
  var url = "mongodb+srv://yoofyoof:yoofyoof@safetrip.mako8.mongodb.net/safeTrip?retryWrites=true&w=majority";
  var client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  // eslint-disable-line no-unused-vars
  client.connect(err=> {
    try {
      const collection = client.db("safeTrip").collection("mDB");
      console.log("Mongodb connected");
      collection.insertOne(data, (err, collection) => {
        if (err) {
          return console.log("Unable to insert report", err);
        }
        console.log("Record Inserted Successfully");
      });
      client.close;
      // return client;
    } catch (err) {
      console.log("error", err);
    }
  });
});
//<-----------end handler for POST and store in db-------->

//<----start add handler to view data -------->
router.get("/getReports", function (req, res, next) {
  const MongoClient = require("mongodb").MongoClient;
  var url = "mongodb+srv://yoofyoof:yoofyoof@safetrip.mako8.mongodb.net/safeTrip?retryWrites=true&w=majority";
  var client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  client.connect(err=> {
    try {
      const collection = client.db("safeTrip").collection("mDB");
      console.log("Mongodb connected here");

      var cursor;
      var resultArray = [];

      cursor = collection.find();

      cursor.forEach(
        function (doc, err) {
          if (err) {
            return console.log("Unable to find data", err);
          }
          resultArray.push(doc);
        },
        function () {
          client.close;
          res.send({ resultArray });
        }
      );
    } catch (err) {
      console.log("error", err);
    }
  });
});
//<----end add handler to view data --->

router.post("/register", async (req, res) => {
  const userInfo = req.body;
  const dbRes = await myDB.getData("safeTrip", "user", {
    $or: [{ username: userInfo.username }, { email: userInfo.email }],
  });

  if (dbRes.length === 0) {
    await myDB.insertData("safeTrip", "user", userInfo);
    res.send({ register: "ok" });
  } else {
    res.send({ registerError: "The account has already existed!" });
  }
});

router.post("/login", async (req, res) => {
  const userInfo = req.body;
  const dbRes = await myDB.getData("safeTrip", "user", userInfo);

  if (dbRes.length === 0) {
    res.send({ loginError: "Wrong username or password!" });
  } else {
    req.session.username = userInfo.username;
    res.send({ login: "ok" });
  }
});

module.exports = router;
