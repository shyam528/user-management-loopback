var path = require('path');
var server = require(path.resolve(__dirname, '../server/server'));
var app = server.dataSources.db;

var Role = app.models.Role;

Role.create([
  {name: 'admin', description: 'Role for admin'},
  {name: 'user', description: 'Role for User'},
], function(err, roles) {
  console.log("err===14", err);
  if (err) throw(err);
  setTimeout(function() {
    console.log("Default user is created.");
    app.disconnect();
  }, 5000);
});