const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "List"
  }],
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Adding a field for username/email and password to the schema
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const User = mongoose.model("User", UserSchema);

module.exports = User;