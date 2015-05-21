var jade = require("jade"),
		 pkg = require('../package.json');

module.exports = function(app, passport) {

	var gameView = jade.renderFile('views/game.jade', {version:pkg.version});
	var loginView = jade.renderFile('views/login.jade', {version:pkg.version});
	var unsupportedView = jade.renderFile('views/unsupported.jade', {version:pkg.version});

	app.get('/', function(req, res){

		var ua = req.headers['user-agent'];

		if (/mobile/i.test(ua)){
			return res.redirect('/unsupported');
		}

		if (!req.isAuthenticated()){
			return res.redirect('/login');
		}

		res.send(gameView);
	});

	app.get('/login', function(req, res){
		res.send(loginView);
	});

	app.get('/unsupported', function(req,res){
		res.send(unsupportedView);
	});

	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
	app.get('/auth/google', passport.authenticate('google', { scope : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'}));

	var login = function(req, res){
		res.cookie("userId", req.user.id, {httpOnly:false});
		res.redirect('/');
	};

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect : '/login'}), login);
	app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect : '/login'}), login);

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});

};