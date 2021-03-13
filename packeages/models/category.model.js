const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, trim: true, required: "ERROR_NAME_MISSING" },
  code: { type: String, default: null },
  status: { type: Number, default: 0 },
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

module.exports = mongoose.model("Category", UserSchema);
