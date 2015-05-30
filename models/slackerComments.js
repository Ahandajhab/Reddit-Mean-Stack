var mongoose = require('mongoose');

var slackerCommentsSchema = new mongoose.Schema({
  title: String,
  link: String,
  commentBody: String,
  upvotes: {type: Number, default: 0},
  slackerPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SlackerPost' }],
  slackerComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'slackerComment' }],
  prevComment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'slackerComment' }],
  author: String
});

slackerCommentsSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

slackerCommentsSchema.methods.downvote = function (cb) {
    this.upvotes -= 1;
    this.save(cb);
};

slackerCommentsSchema.methods.delete = function (cb) {
  this.delete(cb);
  this.remove(cb);
}

slackerCommentsSchema.methods.deleteComment = function (cb) {
  this.delete(cb);
  this.remove(cb);
}
mongoose.model('slackerComment', slackerCommentsSchema);
