var jade = require("jade"),
		 pkg = require('../package.json');

module.exports = function(app, passport) {

	var game = jade.renderFile('views/game.jade', {version:pkg.version});
	var login = jade.renderFile('views/login.jade', {version:pkg.version});

	app.get('/', function(req, res){
		if (!req.isAuthenticated()){
			return res.redirect('/login');
		}

		res.cookie("userId", req.user.id, {httpOnly:false});
		res.send(game);
	});

	app.get('/login', function(req, res){
		res.send(login);
	});

	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
	app.get('/auth/google', passport.authenticate('google', { scope : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'}));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {successRedirect : '/',failureRedirect : '/login'}));
	app.get('/auth/google/callback', passport.authenticate('google', {successRedirect : '/',failureRedirect : '/login'}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

};