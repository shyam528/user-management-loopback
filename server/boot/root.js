module.exports = function(server) {
	// Install a `/` route that returns server status
	var router = server.loopback.Router();
	var user = server.models.user;

	router.get('/', server.loopback.status());

	//verified
	router.get('/verified', function(req, res) {
		res.render('verified');
	});

	/*//send an email with instructions to reset an existing user's password
	router.post('/request-password-reset', function(req, res, next) {
		console.log("===req=13===",req);
		User.resetPassword({
			email: req.body.email
		}, function(err) {
			if (err) return res.status(401).send(err);

			res.render('response', {
				title: 'Password reset requested',
				content: 'Check your email for further instructions',
				redirectTo: '/',
				redirectToLinkText: 'Log in'
			});
		});
	});*/

	//show password reset form
	router.get('/reset-password', function(req, res, next) {
		if (!req.accessToken) return res.sendStatus(401);
		res.render('password-reset', {
			accessToken: req.accessToken.id
		});
	});

	//reset the user's pasword
	router.post('/reset-password', function(req, res, next) {
		if (!req.accessToken) return res.sendStatus(401);
		//verify passwords match
		if (!req.body.password ||
			!req.body.confirmation ||
			req.body.password !== req.body.confirmation) {
			return res.sendStatus(400, new Error('Passwords do not match'));
		}
		user.findById(req.accessToken.userId, function(err, userResponse) {
			if (err) return res.sendStatus(404);
			userResponse.updateAttribute('password', req.body.password, function(err, userUpdate) {
				if (err) return res.sendStatus(404);
				console.log('> password reset processed successfully');
				res.render('reset-password-success', {
					title: 'Password reset success',
					content: 'Your password has been reset successfully',
					redirectTo: '/',
					redirectToLinkText: 'Log in'
				});
			});
		});
	});
  
	server.use(router);
};