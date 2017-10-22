This project has connection with mysql database.You can chnage the required information with your database 
in datasourec.json

In datasource.json, replace the crediatials with yours to send the email in email json.

3) you can create the table in mysql database by using below command

* node bin/createDb.js

4) Whenever you add new model or update any existing model, run the below commant so that changes can reflect 
in your database.

* node bin/updateDb.js

5) In this project, I have implement the code if user update the role of user.

6) To change the password you can use change user password in remote method.
if you are using loopback3 , it already provide chnage userpassword method. so you dont need to use this.

********************************************************
1) Clone the below url  
https://github.com/shyam528/user-management-loopback.git

2) To install all the node packages
npm install

3) To run the project
node .


***********************************
Email me on shyanongit@gmail.com if you have any  query about loopback framework
