var mysql = require("mysql");
var inquirer = require("inquirer");
var passwordFile = require("./password.js");

function bamazonEmployee(){
  this.connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: 'root',
    password: passwordFile.password,
    database: 'bamazonDB'
  });
}

bamazonEmployee.prototype.makeConnection = function(connection){
  return new Promise(function(resolve, reject) {
    connection.connect(function(error){
      if(error) reject(error);
      resolve("connected as id "+connection.threadId);
    });
  });
};

bamazonEmployee.prototype.promptMenu = function(options){
  return inquirer
    .prompt(
      {
        name: "response",
        type: "list",
        message: "What would you like to do?",
        choices: options
      }
    );
};


var manager = new bamazonEmployee();

manager.makeConnection(manager.connection)
.then(function(message){
  console.log(message);
})
.catch(function(error){
  console.log(error);
});
