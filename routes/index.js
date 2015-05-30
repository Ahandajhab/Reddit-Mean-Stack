var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var SlackerPost = mongoose.model('SlackerPost');
var SlackerSub = mongoose.model('SlackerSub');
var SlackerComment = mongoose.model('slackerComment');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

router.get('/comments', function(req, res, next) {
  Comment.find(function(err, comments){
    if(err){ return next(err); }

    res.json(comments);
  });
});

router.get('/Technology', function(req, res, next){
  SlackerPost.find(function(err, posts){
    if(err){return next(err);}
    res.json(posts);
  });
});

router.get('/:SlackerSub', function(req, res, next){
  SlackerPost.find(function(err, posts){
    if(err){return next(err);}
    res.json(posts);
  });
});

router.get('/:title', function(req, res, next){
  Post.find(function(err, posts){
    if(err){return next(err);}
    res.json(posts);
  });
});

// Create a Post
router.post('/posts', auth, function(req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;
  //post.post.title = req.payload.title;
  //post.post.link = req.payload.link;
  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

// Create a Post
router.post('/:SlackerSub/posts', auth, function(req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;
  //post.post.title = req.payload.title;
  //post.post.link = req.payload.link;
  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

// delete a Post
router.post('/posts/:post/delete', auth, function (req, res, next) {
    req.post.remove(function (err, post) {
        if (err) { return next(err); }
        res.json(post);
    });
    //req.post.remove(post);
  //  req.post.remove(function(err, post) {
    //  if(err){ return next(err); }

  //    res.json(post);
  //  });
});

// Preload post objects on routes with ':post'
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error("can't find post")); }

    req.post = post;
    return next();
  });
});

// Preload comment objects on routes with ':comment'
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});
/**
// Preload post objects on routes with ':post'
router.param('SlackerSub', function(req, res, next, id) {
  var query = SlackerSub.findById(id);

  query.exec(function (err, SlackerSub){
    if (err) { return next(err); }
    if (!SlackerSub) { return next(new Error("can't find SlackerSub")); }

    req.SlackerSub = SlackerSub;
    return next();
  });
});
**/
// return a post
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    res.json(post);
  });
});

// return a comment
router.get('/comments/:comment', function(req, res, next){
  //Post p = req.Post;
  //p.comments(req.id).populate('comments', function(err, comment))
  req.comment.populate('subComments', function(err, comment){
    res.json(comment);
  });
});

// return a comment
router.get('/posts/:post/comments/:comment', function(req, res, next){
  //Post p = req.Post;
  //p.comments(req.id).populate('comments', function(err, comment))
  req.comment.populate('comments', function(err, comment){
    res.json(comment);
  });
});

// upvote a post
router.put('/posts/:post/upvote', auth, function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

//route for post downvotes
router.put('/posts/:post/downvote', auth, function (req, res, next) {
    console.log('downvote');
    req.post.downvote(function (err, post) {
        if (err) { return next(err); }
        res.json(post);
    });
});

// create a new comment
router.post('/posts/:post/comment', auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});


//create a new comment on comment
router.post('/comments/:comment/comment', auth, function(req, res, next){
  var commentNew = new Comment(req.body);
  commentNew.post = comment.post;
  commentNew.author = req.payload.username;
  commentNew.prevComment = req.comment;

  comment.save(function(err, commentNew){
    if(err){return next(err); }

    req.comments.get(req.id).push(commentNew);
    req.comments.get(req.id).save(function(err, commentNew){
      if(err){return next(err); }
      res.json(commentNew);
    });
  });
});

//create a new comment on comment
router.post('/posts/:post/comments/:comments/comment', auth, function(req, res, next){
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;
  comment.prevComment = req.comment;

  comment.save(function(err, comment){
    if(err){return next(err); }

    req.post.comments.get(req.id).push(comment);
    req.post.comments.get(req.id).save(function(err, comment){
      if(err){return next(err); }
      res.json(comment);
    });
  });
});

// upvote a comment
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});


// upvote a comment on comment
router.put('/comments/:comment/:comment/upvote', auth, function(req, res, next){
  req.comment.upvote(function(err, comment){
    if(err) { return next(err); }

    res.json(comment);
  });
});

// upvote a comment on comment
router.put('/posts/:post/comments/:comment/comments/:comment/upvote', auth, function(req, res, next){
  req.comment.upvote(function(err, comment){
    if(err) { return next(err); }

    res.json(comment);
  });
});

// downvote a comment
router.put('/posts/:post/comments/:comment/downvote', function (req, res, next) {
    req.comment.downvote(function (err, comment) {
        if (err) { return next(err); }
        res.json(comment);
    });
});

// downvote a comment on comment
router.put('/comments/:comment/:comment/downvote', function (req, res, next) {
    req.comment.downvote(function (err, comment) {
        if (err) { return next(err); }
        res.json(comment);
    });
});

// downvote a comment on comment
router.put('/posts/:post/comments/:comment/comments/:comment/downvote', function (req, res, next) {
    req.comment.downvote(function (err, comment) {
        if (err) { return next(err); }
        res.json(comment);
    });
});
// delete a comment
router.post('/posts/:post/comments/:comment/delete', auth, function (req, res, next) {
    req.comment.remove(function (err, comment) {
        if (err) { return next(err); }
        res.json(comment);
    });
    //req.post.comments.remove(comment);
    //req.post.remove(function(err, post) {
    ///  if(err){ return next(err); }

    //  res.json(comment);
    //});
});

// delete a comment on comment
router.post('/comments/:comments/:comment/delete', auth, function(req, res, next){
  req.comment.remove(function (err, comment){
    if(err) {return next(err);}
    res.json(comment);
  });
});

// delete a comment on comment
router.post('/posts/:post/comments/:comments/comments/:comment/delete', auth, function(req, res, next){
  req.comment.remove(function (err, comment){
    if(err) {return next(err);}
    res.json(comment);
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

module.exports = router;
