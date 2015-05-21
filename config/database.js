var mongoose = require('mongoose');
var auth = require('./auth');

module.exports = function() {

	mongoose.connect(auth.mongodb);

	var userSchema = mongoose.Schema({

		email : {type:String, required:true},

		firstName : {type:String, required:true},

		lastName : {type:String, required:true},

		icon : {type:String},

		facebook : {
			id : String,
			token : String
		},

		google : {
			id : String,
			token : String
		},

		stats : {
			kills : {type:Number, default:0},
			deaths : {type:Number, default:0},
			highScore : {type:Number, default:0}
		},

		isTest : {type:Boolean, default:false}

	});

	userSchema.virtual('fullName').get(function(){
		return this.firstName + ' ' + this.lastName;
	});

	mongoose.model('User', userSchema);

	return mongoose;
};