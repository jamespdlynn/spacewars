var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var mongoose = require('mongoose');
var auth = require('./auth');

var User = mongoose.model('User');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
        clientID        : auth.facebook.clientID,
        clientSecret    : auth.facebook.clientSecret,
        callbackURL     : auth.facebook.callbackURL
    },

    function(token, refreshToken, profile, done) {

        process.nextTick(function() {

            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                if (err) return done(err);
                if (user) return done(null, user);

                user = new User();
                user.firstName = profile.name.givenName;
                user.lastName = profile.name.familyName;
                user.email = profile.emails[0].value;
                user.icon = 'http://graph.facebook.com/'+profile.id+'/picture';
                user.facebook.id = profile.id;
                user.facebook.token = token;

                user.save(function(err) {
                    if (err) return done(err);
                    return done(null, user);
                });

            });
        });

    }));


    // =========================================================================
    // GOOGLE ================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
          clientID        : auth.google.clientID,
          clientSecret    : auth.google.clientSecret,
          callbackURL     : auth.google.callbackURL
      },

      function(token, refreshToken, profile, done) {

          process.nextTick(function() {

              User.findOne({ 'google.id' : profile.id }, function(err, user) {
                  if (err) return done(err);
                  if (user) return done(null, user);

                  user = new User();
                  user.firstName = profile.name.givenName;
                  user.lastName = profile.name.familyName;
                  user.email = profile.emails[0].value;
                  user.icon = profile.photos[0].value;
                  user.google.id = profile.id;
                  user.google.token = token;

                  user.save(function(err) {
                      if (err) return done(err);
                      return done(null, user);
                  });

              });
          });

      }));
};
