angular.module('SlackerNews', ['ui.router'])
.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['posts', function(posts){
          return posts.getAll();
        }]
      }
    })
    .state('News', {
      url: '/News',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['posts', function(posts){
          return posts.getAll();
        }]
      }
    })
    .state('Technology', {
      url: '/Technology',
      templateUrl: '/slackerSub.html',
      controller: 'MainSlackerCtrl',
      resolve: {
        postPromise: ['posts', function(posts){
          return posts.getAll();
        }]
      }
    })
    .state('slackerSubs', {
      url: '/s/{Title}',
      templateUrl: '/slackerSubs.html',
      controller: 'SlackerSubsCtrl',
      resolve: {
        postPromise: ['slackerSubs', function(slackerSubs){
          return slackerSubs.getAllSlacker($stateParams.Title);
        }]
      }
    })
    .state('subs', {
      url: '/Politics',
      templateUrl: '/slackerSubs.html',
      controller: 'SlackerSubsCtrl',
      resolve: {
        postPromise: ['slackerSubs', function(slackerSubs){
          return slackerSubs.getAllSlacker($stateParams.Title);
        }]
      }
    })
    .state('sub', {
      url: '/s/{Title}/{id}',
      templateUrl: '/posts.html',
      controller: 'subCtrl',
      resolve: {
        post: ['$stateParams', 'posts', function($stateParams, slackerSubs) {
          return slackSubs.get($stateParams.Title, $stateParams.id);
        }]
      }
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl',
      resolve: {
        post: ['$stateParams', 'posts', function($stateParams, posts) {
          return posts.get($stateParams.id);
        }]
      }
    })
    .state('commentsSub', {
      url: '/posts/:post/{id}',
      templateUrl: '/comments.html',
      controller: 'CommentsCtrl',
      resolve: {
      /**  post: ['$stateParams', 'posts', function($stateParams, posts){
          return posts.get($stateParams.id);
        }]**/
        comment: ['$stateParams', 'comments', function($stateParams, post) {
          return (post.comments.get($stateParams.id));
        }]
      }
    })
    .state('comments', {
      url: '/comments/{id}',
      templateUrl: '/comments.html',
      controller: 'CommentsCtrl',
      resolve: {
      /**  post: ['$stateParams', 'posts', function($stateParams, posts){
          return posts.get($stateParams.id);
        }] **/
        comment: ['$stateParams','comments', function($stateParams, comments) {
          return comments.getComments($stateParams.id);
        }]
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })

  //$urlRouterProvider.otherwise('home');
}])
.factory('posts', ['$http', 'auth', function($http, auth){
  var o = {
    posts: []
  };

  o.refresh = function(){
    o = { posts: []};
    return $http.get('/');
  }
  o.getComment = function(post, id){
    return $http.get('/comments/' + id).then(function(res){
      return res.data;
    });
  };
  o.getAllComment = function(post, id){
    return $http.get('/comments/' + id + '/comments').success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.get = function(id) {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
    });
  };

  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.getAllSlacker = function(title){
    return $http.get('/' + title).success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.create = function(post) {
    return $http.post('/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.posts.push(data);
    });
  };
  /**
  o.create = function(slackerPost) {
    return $http.post('/{{post.title}}/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.slackerPosts.push(data);
    });
  };**/
  o.deletePost = function(post){
    return $http.post('/posts/' + post._id + '/delete', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    })
  };
  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(dta){
      post.upvotes += 1;
    });
  };
  //downvotes
  o.downvote = function (post) {
      return $http.put('/posts/' + post._id + '/downvote', post, {
        headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
              post.upvotes -= 1;
          });
  };
  o.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comment', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  o.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      comment.upvotes += 1;
    });
  };

  //downvote comments
  //I should really consolidate these into one voteHandler function
  o.downvoteComment = function (post, comment) {
      return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', comment, {
        headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
            comment.upvotes -= 1;
        });
      };
  // delete comment
  o.deleteComment = function(post, comment){
    return $http.post('/posts/' + post._id + '/comments/' + comment._id + '/delete', comment, {
      headers: {Authorization: 'Bearer ' +auth.getToken()}
    });

  };

    return o;
}])
.factory('comments', ['$http', 'auth', function($http, auth){
  var c = {
    comments: []
  };
  c.getComment = function(comment){
    return $http.get('/comments/' + comment._id).then(function(res){
      return res.data;
    });
  };
  c.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  c.upvoteComment = function(comment) {
    return $http.put('/comments/'+ comment._id + '/upvote', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      comment.upvotes += 1;
    });
  };

  //downvote comments
  //I should really consolidate these into one voteHandler function
  c.downvoteComment = function (comment) {
      return $http.put('/comments/' + comment._id + '/downvote', comment, {
        headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
            comment.upvotes -= 1;
        });
      };
  // delete comment
  c.deleteComment = function(post, comment){
    return $http.post('/posts/' + post._id + '/comments/' + comment._id + '/delete', comment, {
      headers: {Authorization: 'Bearer ' +auth.getToken()}
    });

  };
  return c;
}])
.factory('slackerPosts', ['$http', 'auth', function($http, auth){
  var o = {
    slackerPosts: []
  };

  o.refresh = function(){
    o = { posts: []};
    return $http.get('/');
  }
  o.getComment = function(post, id){
    return $http.get('/comments/' + id).then(function(res){
      return res.data;
    });
  };
  o.getAllComment = function(post, id){
    return $http.get('/comments/' + id + '/comments').success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.get = function(id) {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
    });
  };

  o.getAll = function() {
    return $http.get('/slackerPosts').success(function(data){
      angular.copy(data, o.slackerPosts);
    });
  };
  o.getAllSlacker = function(title){
    return $http.get('/' + title).success(function(data){
      angular.copy(data, o.slackerPosts);
    });
  };
  o.create = function(post) {
    return $http.post('/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.posts.push(data);
    });
  };
  o.create = function(post) {
    return $http.post('/{{post.title}}/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.slackerPosts.push(data);
    });
  };
  o.deletePost = function(post){
    return $http.post('/posts/' + post._id + '/delete', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    })
  };
  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(dta){
      post.upvotes += 1;
    });
  };
  //downvotes
  o.downvote = function (post) {
      return $http.put('/posts/' + post._id + '/downvote', post, {
        headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
              post.upvotes -= 1;
          });
  };
  o.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  o.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      comment.upvotes += 1;
    });
  };

  //downvote comments
  //I should really consolidate these into one voteHandler function
  o.downvoteComment = function (post, comment) {
      return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', comment, {
        headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){
            comment.upvotes -= 1;
        });
      };
  // delete comment
  o.deleteComment = function(post, comment){
    return $http.post('/posts/' + post._id + '/comments/' + comment._id + '/delete', comment, {
      headers: {Authorization: 'Bearer ' +auth.getToken()}
    });

  };

    return o;
}])
.factory('auth', ['$http', '$window', '$rootScope', function($http, $window, $rootScope){
   var auth = {
    saveToken: function (token){
      $window.localStorage['slacker-news-token'] = token;
    },
    getToken: function (){
      return $window.localStorage['slacker-news-token'];
    },
    isLoggedIn: function(){
      var token = auth.getToken();

      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    },
    currentUser: function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.username;
      }
    },
    register: function(user){
      return $http.post('/register', user).success(function(data){
        auth.saveToken(data.token);
      });
    },
    logIn: function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
    },
    logOut: function(){
      $window.localStorage.removeItem('slacker-news-token');
    }
  };

  return auth;
}])
.controller('MainCtrl', [
'$scope',
'posts',
'auth',
function($scope, posts, auth){
  $scope.test = 'Hello world!';
  $scope.posts = posts.posts;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.addPost = function(){
       if($scope.title.length == 0) {
           alert('Title is required!');
           return;
       }

       //regex from https://gist.github.com/jpillora/7885636

       var isValidUrl = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

       var url = $scope.link;

       //link is not required, but if present it must be valid

       if($scope.link && !isValidUrl.test(url)) {
           alert('You must include a full valid url! (ex: http://www.example.com)');
           return;
       }
    posts.create({
      title: $scope.title,
      link: $scope.link,
      tag: "home",
      postBody: $scope.postBody,
    });
    $scope.title = '';
    $scope.link = '';
    $scope.postBody ='';
  };

  $scope.upvote = function(post) {
    posts.upvote(post);
  };
  $scope.downvote = function (post) {
      posts.downvote(post);
  };
  $scope.delete = function(post){
    posts.deletePost(post);
    posts.refresh();
    posts.getAll();
  };
}])
.controller('MainSlackerCtrl', [
'$scope',
'posts',
'auth',
'subReddit',
function($scope, posts, auth, subReddit){
  $scope.test = 'Hello world!';
  $scope.posts = posts.posts;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.addPost = function(){
       if($scope.title.length == 0) {
           alert('Title is required!');
           return;
       }

       //regex from https://gist.github.com/jpillora/7885636

       var isValidUrl = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

       var url = $scope.link;

       //link is not required, but if present it must be valid

       if($scope.link && !isValidUrl.test(url)) {
           alert('You must include a full valid url! (ex: http://www.example.com)');
           return;
       }
    posts.create({
      title: $scope.title,
      link: $scope.link,
      tag: subReddit,
      postBody: $scope.postBody,
    });
    $scope.title = '';
    $scope.link = '';
    $scope.postBody ='';
  };

  $scope.upvote = function(post) {
    posts.upvote(post);
  };
  $scope.downvote = function (post) {
      posts.downvote(post);
  };
  $scope.delete = function(post){
    posts.deletePost(post);
    posts.refresh();
    posts.getAll();
  };
}])
.controller('SlackerSubsCtrl', [
'$scope',
'slackerPosts',
'posts',
'auth',
'title',
function($scope, slackerPosts, auth){
  $scope.test = 'Hello world!';
  $scope.slackerPosts = slackerPosts.slackerPosts;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.addPost = function(){
       if($scope.title.length === 0) {
           alert('Title is required!');
           return;
       }

       //regex from https://gist.github.com/jpillora/7885636

       var isValidUrl = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

       var url = $scope.link;

       //link is not required, but if present it must be valid

       if($scope.link && !isValidUrl.test(url)) {
           alert('You must include a full valid url! (ex: http://www.example.com)');
           return;
       }
    slackerPosts.createS({
      title: $scope.title,
      link: $scope.link,
      tag: title,
      postBody: $scope.postBody,
    });
    $scope.title = '';
    $scope.link = '';
    $scope.postBody = '';
  };

  $scope.upvote = function(slackerPost) {
    slackerPosts.upvote(slackerPost);
  };
  $scope.downvote = function (slackerPost) {
    slackerPosts.downvote(slackerPost);
  };
  $scope.delete = function(slackerPost){
    slackerPosts.deletePost(slackerPost);
    slackerPosts.refresh();
    slackerPosts.getAll();
  };
}])
.controller('subCtrl', [
'$scope',
'slackerSubs',
'posts',
'post',
'auth',
function($scope, posts, post, auth){
  $scope.post = post;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.addComment = function(){
    if($scope.body === '') { return; }
    posts.addComment(post._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment) {
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };

  $scope.upvote = function(comment){
    posts.upvoteComment(post, comment);
  };
  $scope.downvote = function (comment) {
    posts.downvoteComment (post, comment);
  };
  $scope.delete = function(comment){
    posts.deleteComment(post, comment);
    posts.refresh();
    posts.get(post._id);
  };
}])
.controller('PostsCtrl', [
'$scope',
'posts',
'post',
'auth',
function($scope, posts, post, auth){
  $scope.post = post;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.addComment = function(){
    if($scope.body === '') { return; }
    posts.addComment(post._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment) {
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };

  $scope.upvote = function(comment){
    posts.upvoteComment(post, comment);
  };
  $scope.downvote = function (comment) {
    posts.downvoteComment (post, comment);
  };
  $scope.delete = function(comment){
    posts.deleteComment(post, comment);
    posts.refresh();
    posts.get(post._id);
  };
  $scope.commentOnComment = function(comment){

  };
}])
.controller('CommentsCtrl', [
'$scope',
'comments',
'auth',
function($scope, comments, comment, auth){
  $scope.post = post;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.addCommentonComment = function(){
    if($scope.body === '') { return; }
    comments.addCommentonComment(post._id, comment._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment) {
      $scope.post.comments.getToken(comment._id).push(comment);
    });
    $scope.body = '';
  };

  $scope.upvote = function(commentP, comment){
    comments.upvoteCommentOnComment(post, commentP, comment);
  };
  $scope.downvote = function (commentP, comment) {
    comments.downvoteCommentonComment (post, commentP, comment);
  };
  $scope.delete = function(commentP, comment){
    comments.deleteCommentonComment(post, commentP, comment);
    comments.refresh();
    comments.get(post._id);
  };
}])
.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])
.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
