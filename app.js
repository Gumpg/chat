
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path');


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var users = [];

app.get('/', function(req, res){
  if (req.cookies.user == null) {
    res.redirect('/signin');
  };
  res.sendfile('views/index.html');
});

app.get('/signin', function(req, res){
  res.sendfile('views/signin.html');
});

app.post('/signin', function(req, res){
  console.log(req.body.name);
  if(users.indexOf(req.body.name) != -1){
    res.redirect('/signin');
  }else{
    res.cookie('user', req.body.name, {maxAge:1000*60*60*24*30});
    res.redirect('/');
  }
});


io.sockets.on("connection", function(socket){

  socket.on("say", function(data){
    console.log(data.data);
    socket.broadcast.emit("tosay", data);
  }); 

  socket.on("online", function(data){
    console.log("some one up!");
    if(users.indexOf(data.user) == -1){
      users.push(data.user);
    }
    console.log(users[0]);
    io.sockets.emit("online", {users: users});
  });

  // socket.on("disconnect", function(data){
  //   console.log("some one down");
  //   users.splice(users.indexOf(socket.user), 1);
  //   io.sockets.emit("offline", {user: users});
  // });

});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
