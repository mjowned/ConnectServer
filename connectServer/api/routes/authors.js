var express = require('express');
var _ = require('underscore');
var router = express();
var handleError;

var mongoose = require('mongoose');
Author = mongoose.model('Author');
Book = mongoose.model('Book');

/*
	TODO:
	- Populate boeken
	- Paging:
		QueryString variabelen pageSize, PageIndex
		Gesorteerd op ranking
	- Filtering: QueryString variabele: country
	- Filtering: QueryString variabele: fullName
	- Projecting:
		fullname is een property die opgehaald wordt
		age is een property die opgehaald wordt
		numberOfBooks is een property die opgehaald wordt
*/
function getAuthors(req, res){
	var query = {};
	if(req.params.id){
		query._id = req.params.id;
	} 

	var result = Author.find(query);

	result
		.then(data => {
//			if(err){  }

			// We hebben gezocht op id, dus we gaan geen array teruggeven.
			if(req.params.id){
				data = data[0];
			}
			return res.json(data);
		})
//		.fail(err => handleError(req, res, 500, err));
}

function addAuthor(req, res){
	var author = new Author(req.body);
	author
		.save()
		.then(savedAuthor => {
			if(err){ return handleError(req, res, 500, err); }
			else {
				res.status(201);
				res.json(savedAuthor);
			}
		})
		.fail(err => handleError(req, res, 500, err));
}

/*
	TODO:
	- Vind Author
	- Book in collectie books aanmaken als die niet bestaat 
	- Book ID refereren vanuit Author
	- Author met nieuw book teruggeven
	- Mocht iets van dit mis gaan dan handleError(req, res, statusCode, err) aanroepen
*/
function addBook(req, res){
	res.json({});
}

/*
	TODO:
	- Vind Author by :id,
	- Vind Book bij author met :bookId,
	- Verwijder boek van Author
	- Author zonder betreffende book teruggeven
	- Mocht iets van dit mis gaan dan handleError(req, res, statusCode, err) aanroepen
*/
function deleteBook(req, res){
	res.json({});
}

// Routing
router.route('/')
	.get(getAuthors)
	.post(addAuthor);

router.route('/:id')
	.get(getAuthors);

router.route('/:id/books')
	.post(addBook);

router.route('/:id/books/:bookId')
	.delete(deleteBook);

// Export
module.exports = function (errCallback){
	console.log('Initializing authors routing module');
	
	handleError = errCallback;
	return router;
};