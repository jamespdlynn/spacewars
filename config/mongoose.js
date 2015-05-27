var mongoose = require('mongoose');
var auth = require('./auth');

mongoose.connect(auth.mongodb);

var UserSchema = mongoose.Schema({

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

	highScore : {type:Number, default:0, index:true},

	isBot : {type:Boolean, default:false}

});

UserSchema.virtual('fullName').get(function(){
	return this.firstName + ' ' + this.lastName;
});

UserSchema.methods.toJSON = function() {
	return {
		name : this.fullName,
		icon : this.icon,
		highScore : this.highScore
	}
};

mongoose.model('User', UserSchema);

module.exports = mongoose;