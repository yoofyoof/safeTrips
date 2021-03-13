const express = require("express");
const router = express.Router();
const myDB = require("../db/MyDB.js");

// router.get("/getReports", async (req, res) => {
//   try {
//     const files = await myDB.getData("safeTrip", "report", {});
//     res.send({ files: files, username: req.session.username });
//   } catch (e) {
//     console.log("Error", e);
//     res.status(400).send({ err: e });
//   }
// });

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

  var { MongoClient } = require("mongodb");
  var url = "mongodb://localhost:27017";
  var DB_NAME = "safeTrip";
  // eslint-disable-line no-unused-vars
  MongoClient.connect(url, function (err, db) {
    try {
      var client = new MongoClient(url, { useUnifiedTopology: true });
      client.connect();
      const db = client.db(DB_NAME);
      console.log("Mongodb connected");
      db.collection("mDB").insertOne(data, (err, collection) => {
        if (err) {
          return console.log("Unable to insert report", err);
        }
        console.log("Record Inserted Successfully");
      });
      db.close;
      // return client;
    } catch (err) {
      console.log("error", err);
    }
  });
  //var client = connect();
});
//<-----------end handler for POST and store in db-------->

//<----start add handler to view data -------->
router.get("/getReports", function (req, res, next) {
  var { MongoClient } = require("mongodb");
  var url = "mongodb://localhost:27017";
  var DB_NAME = "safeTrip";

  MongoClient.connect(url, function (err, db) {
    try {
      var client = new MongoClient(url, { useUnifiedTopology: true });
      client.connect();
      const db = client.db(DB_NAME);
      console.log("Mongodb connected here");

      var cursor;
      var resultArray = [];

      cursor = db.collection("mDB").find();

      cursor.forEach(
        function (doc, err) {
          if (err) {
            return console.log("Unable to find data", err);
          }
          resultArray.push(doc);
        },
        function () {
          db.close;
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
