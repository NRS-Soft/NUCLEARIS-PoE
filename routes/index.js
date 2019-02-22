const express = require('express'),
	router = express.Router({ mergeParams: true }),
	User = require('../models/user'),
	multer = require('multer'),
	upload = multer({ dest: 'uploads/' }),
	passport = require('passport'),
	bruteforce = require('../models/bruteforce');

router.get('/', function(req, res) {
	console.log(req.session);
	res.render('home');
});

router.get('/signup', function(req, res) {
	res.render('signup');
});

router.post('/signup', bruteforce.prevent, upload.none(), function(req, res) {
	User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
		if (err) {
			let data = 'Usuario ya existente, por favor usar otro nombre de usuario';
			if (err.message === 'A user with the given username is already registered') {
				return res.render('signup', { message: data });
			}
		}
		if (!user) return res.render('signup', { message: err.message });
		passport.authenticate('local')(req, res, function() {
			res.redirect('/');
		});
	});
});

router.get('/login', function(req, res) {
	res.render('login');
});

router.post('/login', bruteforce.prevent, upload.none(), function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) return next(err);
		if (!user) {
			let data = 'Incorrecto usuario o contraseña';
			if (info.message === 'Password or username is incorrect') {
				return res.render('login', { message: data });
			}
		}
		req.logIn(user, function(err) {
			if (err) return next(err);
			return res.redirect('/');
		});
	})(req, res, next);
});

router.get('/logout', function(req, res) {
	req.logout();
	req.session = null;
	res.clearCookie('session');
	res.redirect('/');
});

module.exports = router;
