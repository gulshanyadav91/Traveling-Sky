const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";

main()
  .then(() => {
    console.log("connected to the mongoDb");
  })
  .catch((err) => {
    console.log(err);
  });

async function main(params) {
  await mongoose.connect(MONGO_URL);
}

const initDb = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "68aa9379d2ce4b2607ee708e",
  }));
  await Listing.insertMany(initData.data);
  console.log("Db is initialized");
};

initDb();
