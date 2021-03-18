const { MongoClient } = require("mongodb");

function MyDB() {
  const myDB = {};
  const url =
    "mongodb+srv://yoofyoof:yoofyoof@safetrip.mako8.mongodb.net/safeTrip?retryWrites=true&w=majority";'
  // You might want to consider hide the MongoDB credentials with application setting, the url contains your username and password, anybody can log in now.

  myDB.getData = async (dbName, colName, query) => {
    let client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(colName);
    const data = await collection.find(query).toArray();
    client.close();
    return data;
  };

  myDB.insertData = async (dbName, colName, insertingOBJ) => {
    let client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(colName);
    try {
      await collection.insertOne(insertingOBJ);
    } catch (e) {
      console.log(e);
    } finally {
      client.close();
    }
  };

  myDB.deleteData = async (dbName, colName, queryToDelete) => {
    let client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(colName);
    try {
      await collection.deleteOne(queryToDelete);
    } catch (e) {
      console.log(e);
    } finally {
      client.close();
    }
  };

  return myDB;
}

module.exports = MyDB();
