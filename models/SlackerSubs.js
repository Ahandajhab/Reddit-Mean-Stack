var mongoose = require('mongoose');

var SlackerSubsSchema = new mongoose.Schema({
  title: String,
  SlackerPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SlackerPost' }],
  moderator: String
});

SlackerSubsSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

SlackerSubsSchema.methods.downvote = function (cb) {
    this.upvotes -= 1;
    this.save(cb);
};

SlackerSubsSchema.methods.delete = function (cb) {
  this.delete(cb);
  this.remove(cb);
}

SlackerSubsSchema.methods.deleteComment = function (cb) {
  this.delete(cb);
  this.remove(cb);
}
mongoose.model('SlackerSub', SlackerSubsSchema);
