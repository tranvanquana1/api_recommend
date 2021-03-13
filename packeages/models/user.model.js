const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId

const UserSchema = new Schema({
  username: { type: String, required: "ERROR_NAME_MISSING" },
  password: { type: String, required: "ERROR_PASSWORD_MISSING" },
  fullname: { type: String, default: null },
  mobile: { type: String, default: null },
  status: { type: Number, default: 0 },
  token: {type: String, default: null},
  movies : [{ _id: {type: ObjectId, ref: "Movie", index: true, default: null}, rating: {type: Number, required: "ERROR_RATING_MISSING"}}],
  created_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

/**
 * pre-save hook
 */

UserSchema.pre("save", function (next) {
  this.update_at = Date.now();
  next();
});


module.exports = mongoose.model("User", UserSchema);
