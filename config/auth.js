// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'mongodb' : 'mongodb://spacewars:B1llB1ll1950@ds031942.mongolab.com:31942/spacewars_dev',

	'facebook' : {
		'clientID' 		: '892356054140847', // your App ID
		'clientSecret' 	: '7a72ba73e90801156661586c84240841', // your App Secret
		'callbackURL' 	: 'http://localhost:3000/auth/facebook/callback'
	},

	'google' : {
		'clientID' 		: '66960280098-17j7p6kc4ml1lsijp37bieup5i9ftlpd.apps.googleusercontent.com',
		'clientSecret' 	: 'QfqPS7ax8OcqliTCzDCgK-K5',
		'callbackURL' 	: 'http://localhost:3000/auth/google/callback'
	}

};