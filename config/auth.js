// config/auth.js
switch (process.env.NODE_ENV)
{
	case "production":

		module.exports = {

			'mongodb' : 'mongodb://spacewars:B1llB1ll1951@ds031952.mongolab.com:31952/spacewars',

			'facebook' : {
				'clientID' 		: '892356054140847', // your App ID
				'clientSecret' 	: '7a72ba73e90801156661586c84240841', // your App Secret
				'callbackURL' 	: 'http://hypergalactic.net/auth/facebook/callback'
			},

			'google' : {
				'clientID' 		: '66960280098-17j7p6kc4ml1lsijp37bieup5i9ftlpd.apps.googleusercontent.com',
				'clientSecret' 	: 'QfqPS7ax8OcqliTCzDCgK-K5',
				'callbackURL' 	: 'http://hypergalactic.net/auth/google/callback'
			}

		};
		break;

	case "development":
	default :
		module.exports = {

			'mongodb' : 'mongodb://spacewars:B1llB1ll1950@ds031942.mongolab.com:31942/spacewars_dev',

			'facebook' : {
				'clientID' 		: '897929726916813', // your App ID
				'clientSecret' 	: 'c31e1aa64fa5eeaab8ca108264f360a8', // your App Secret
				'callbackURL' 	: 'http://localhost/auth/facebook/callback'
			},

			'google' : {
				'clientID' 		: '66960280098-17j7p6kc4ml1lsijp37bieup5i9ftlpd.apps.googleusercontent.com',
				'clientSecret' 	: 'QfqPS7ax8OcqliTCzDCgK-K5',
				'callbackURL' 	: 'http://localhost/auth/google/callback'
			}

		};
		break;
}
