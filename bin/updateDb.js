var path = require('path');
var app = require(path.resolve(__dirname, '../server/server'));
var dataSource = app.datasources.db;

var models = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role','user'];

dataSource.isActual(models, function(err, actual) {
    if(err) throw err;
    if (!actual) {
        dataSource.autoupdate(models, function(err, result) {
            if(err) throw err;
        	console.log("Table is updated successfully in database.");
            console.log("err",err);
            dataSource.disconnect();
        });
    } else {
    	console.log("Your table is already updated in database.");
        dataSource.disconnect();
    }
});