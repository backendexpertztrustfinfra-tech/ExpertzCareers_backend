const mongoose = require("mongoose");

const testSchema = mongoose.Schema({
  name: { type: String, required: true }
});

const Test = mongoose.model("TestByAK", testSchema);
module.exports = Test;