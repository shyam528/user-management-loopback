var config = require('../../server/config.json');
var loopback = require("loopback");
var path = require('path');
var bcrypt = require('bcrypt')

module.exports = function(user) {
	
	var app;
	user.on('attached', function(a) {
		app = a;
	});

	delete user.validations.username;

	//Assign static role to new user
	user.observe('before save', function setRoleMapping(ctx, next) {
		var RoleMapping = app.models.RoleMapping;
	  	var Role = app.models.Role;
		if(ctx.isNewInstance || ctx.instance) {
  			var roleId = 'user';
	      	Role.findOne({where: {name: roleId}}, function(err, role) {
	      		if (err){
	      			console.log("role find in user", err,new Date())
	      			next(err);
	      		}
	      		role.principals.create({
	        		principalType: RoleMapping.USER,
	        		principalId: ctx.instance.id
		      	}, function(err, principal) {
           			if (err){
	      				console.log("role create in user", err,new Date())
           				next(err);
           			}else {
           				next();
           			}
	         	});
		    });
  		} else{
	  		if(ctx.currentInstance.role && ctx.data.role){
				if(ctx.currentInstance.role === ctx.data.role){
					ctx.data.role = ctx.currentInstance.role;
				} 
				next();
			} else if(!ctx.data.role){
				next();
			} else {
				ctx.data.role = 'user';
				next();
			}
  		}
	});

	//send verification email after registration
	user.afterRemote('create', function(context, userInstance, next) {
		var options = {
			type: 'email',
			host:config.host,
			to: userInstance.email,
			from: 'test@viithiisys.com',
			subject: 'Thanks for registering.',
			template: path.resolve(__dirname, '../../server/views/verify.ejs'),
			redirect: '/verified',
			user: user
		};
		userInstance.verify(options, function(err, response, next) {
			if (err) return next(err);
			console.log('> verification email sent:', response);
			userInstance.title = 'Signed up successfully',
			userInstance.content =  'Please check your email and click on the verification link before logging in.',
			userInstance.redirectTo = '/',
			userInstance.redirectToLinkText = 'Log in'
			context.res.send(userInstance);
		});
	});


	//send password reset link when requested
	user.on('resetPasswordRequest', function(info) {
		var data = {
			"link" : config.host+':'+config.port+'/reset-password?access_token='+info.accessToken.id
		}
		var renderer = loopback.template(path.resolve(__dirname, '../../server/views/pwd-reset-req-email.ejs'));
		html_body = renderer(data);
		user.app.models.Email.send({
			to: info.email,
			subject: 'Password reset',
			html: html_body,
			redirect:'/request-password-reset'
		}, function(err) {
			if (err) return console.log('> error sending password reset email');
			console.log('> sending password reset email to:', info.email);
		});
	});

	//Chnage Password
	user.changeUserPassword = function(user_id, req, cb) {
		if(req.newPassword === req.confirmPassword){
			user.findById(user_id, function(err, userFindResult) {
			    if (err) {
			   		cb(err,null)
			    }
			    else {
			    	if(userFindResult !== null){
			    		bcrypt.compare(req.oldPassword, userFindResult.password, function(err, res) {
						    if(err){
						    	var error = new Error();
						    	error.message = "Bcryt compare Failed";
						    	cb(null,error);
						    } else {
						    	if(res){
						    		var hash = bcrypt.hashSync(req.newPassword, 10);
						    		userFindResult.updateAttribute('password', hash, function(err, userUpdateResult) {
										if (err) {
											cb(err,null)
										}
										var pwd= {
											password : req.newPassword
										}
										var renderer = loopback.template(path.resolve(__dirname, '../../server/views/pwd-change-email.ejs'));
										html_body = renderer(pwd);
										user.app.models.Email.send({
											to: userFindResult.email,
											subject: 'Password Changed Successfully',
											html: html_body,
										}, function(err) {
											if (err) return console.log('> error sending password reset email');
											console.log('> sending password change email to:', user.email);
										});
										var data = new Error();
							    		data.message = "Password Changed Successfully.Please check your email";
							    		cb(null,data);
									});
						    	} else {
						    		var error = new Error();
						    		error.message = "oldPassword is not correct";
						    		cb(null,error);
						    	}
						    }
						});
			    	} else {
			    		var error = new Error();
			    		error.message = "User not found";
			    		cb(null,error);
			    	}
			    }
		  	});
		} else {
			var error = new Error();
			error.message = "newPassword and confirmPassword Should be Same";
			cb(null,error);
		}
	};

	user.remoteMethod('changeUserPassword', {
		accepts: [
			{arg: 'user_id', type: 'number',  'http': { source: 'query' }},
			{arg: 'req', type: 'object', 'http': {source: 'body'}}
		],
		returns: [{arg: 'res', type: 'object', 'http': {source: 'body'}}],
		description: ['Change password of user.'],
		http: {path:'/changeUserPassword', verb: 'post'}
	});

};