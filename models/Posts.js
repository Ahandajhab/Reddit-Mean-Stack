
var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: String,
  link: String,
  postBody: String,
  upvotes: {type: Number, default: 0},
  tag: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  SlackerSub: [{type: mongoose.Schema.Types.ObjectId, ref: 'SlackerSubs'}],
  author: String
});

PostSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

PostSchema.methods.downvote = function (cb) {
    this.upvotes -= 1;
    this.save(cb);
};

PostSchema.methods.delete = function (cb) {
  this.delete(cb);
  this.remove(cb);
}

PostSchema.methods.deleteComment = function (cb) {
  this.delete(cb);
  this.remove(cb);
}
PostSchema.methods.find = function(tag){
  if(this.tag == tag)
    return this;
}
mongoose.model('Post', PostSchema);
