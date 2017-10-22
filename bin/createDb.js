var path = require('path');
var server = require(path.resolve(__dirname, '../server/server'));
var ds = server.dataSources.db;
var loopback = require('loopback');

loopback.User.attachTo(ds);

var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role','user'];

ds.automigrate(lbTables, function(err) {
    console.log("err", err);
    if (err) throw err;
    console.log('Looback tables [' + lbTables + '] created in ',ds.adapter.name);
    ds.disconnect();
});