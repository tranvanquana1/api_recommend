const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const MovielSchema = new Schema({
  title: {type: String, required: 'ERROR_TITLE_MISSING'},
  IMDb_URL: {type: String, default: null},
  release_date: {type: String, default: null},
  video_release_date: {type: String, default: null},
  category: [{type: ObjectId, ref: "Category", index: true }],
  status: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
})

/**
 * pre-save hook
 */

MovielSchema.pre("save", function (next) {
  this.update_at = Date.now();
  next();
});

module.exports = mongoose.model("Movie", MovielSchema);
