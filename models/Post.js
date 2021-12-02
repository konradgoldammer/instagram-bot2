const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  date: {
    type: Date,
    default: () => new Date(),
  },
  url: {
    type: String,
    required: true,
  },
});

const Post = mongoose.model("post", postSchema);
module.exports = Post;
