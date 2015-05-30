var mongoose = require('mongoose');

var SlackerPostsSchema = new mongoose.Schema({
  title: String,
  link: String,
  postBody: String,
  tag: String,
  upvotes: {type: Number, default: 0},
  slackerComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'slackerComments' }],
  author: String
});

SlackerPostsSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

SlackerPostsSchema.methods.downvote = function (cb) {
    this.upvotes -= 1;
    this.save(cb);
};

SlackerPostsSchema.methods.delete = function (cb) {
  this.delete(cb);
  this.remove(cb);
}

SlackerPostsSchema.methods.deleteComment = function (cb) {
  this.delete(cb);
  this.remove(cb);
}
mongoose.model('SlackerPost', SlackerPostsSchema);
