
var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  body: String,
  author: String,
  upvotes: {type: Number, default: 0},
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  subComments: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
  prevComment: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}
});

CommentSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

CommentSchema.methods.downvote = function (cb) {
    this.upvotes -= 1;
    this.save(cb);
};

CommentSchema.methods.delete = function(cb){
  //this.delete(cb);
  this.remove(cb);
  this.post.comment(this).delete;
}
mongoose.model('Comment', CommentSchema);
