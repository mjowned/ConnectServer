'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

var mongoose = require('mongoose');
User = mongoose.model('User');

module.exports = {
  getUsers: getUserList,
	getUser: getUserByID,
};

function getUserList(req, res) {
	var query = {};
	var result = User.find(query).then(data => {
		return res.json(data);
	})
	.fail(err => handleError(req, res, 500, err));
}

function getUserById(req, res) {
	var query = {};

	//req.swagger contains the path parameters
	query._id = req.swagger.params.id.value;

	var userResult = User.find(query).then(data => {
			// Don't return an array, return the element
			if(req.swagger.params.id){
				data = data[0];
			}
			return res.json(data);
	})
	.fail(err => handleError(req, res, 500, err));
}