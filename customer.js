var mysql = require("mysql");
var inquirer = require("inquirer");
var passwordFile = require("./password.js");

var connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: 'root',
  password: passwordFile.password,



  database: 'bamazonDB'
});



connection.connect(function(error) {
  if(error) throw error;
  console.log("connected as id "+connection.threadId);
  var products = [];
  customerStart();

});

function customerStart(){
  displayProducts().then(function(res){
    console.log(res);
    console.log(res.length);
    for(var r in res){
      products.push("Product "+res[r].item_id+": "+res[r].product_name+" - $"+res[r].price+" ("+res[r].stock_quantity+" in stock)");
    }
    products.push("Quit without purchasing");
    promptProduct(products).then(function(response){
      if(response.purchaseName == "Quit without purchasing"){
        connection.end();
        return;
      }
      else{
        console.log(response);
        var purchaseName = /Product \d*\:/.exec(response.product)[0];
        var purchaseId = purchaseName.slice(8, purchaseName.length-1);
      }
    });
  });
}

function promptProduct(products){
  return inquirer
    .prompt(
      {
        name: "product",
        type: "list",
        message: "What would you like to purchase?",
        choices: products
      }
    );
}

function promptQuantity(){
  return inquirer
    .prompt(
      {
        name: "quantity",
        type: "input",
        message: "How many would you like to purchase? (Please enter an integer)",
        validate: function(input){
          return !isNaN(input);
        }
      }
    );
}

function makePurchase(){
  //check if in stock_quantity
  //if too low, abort and error,
  //otherwise, run updateProduct
}

function updateProduct(purchased_quantity){
  var query = connection.query(
    // ? fills in with the following argument
    "update products set ? where ?",
    [
      {
        quantity:100,
      },
      {
        id:4,
      }
    ],
    function(err, res){
      // reports how many rows are affected
      console.log(res.affectedRows);
      deleteProduct();
    }
  );

  // logs the query in sql form
  console.log(query.sql);
}

function displayProducts(){
  return new Promise(function(resolve, reject) {
    var query = connection.query(
      // ? fills in with the following argument
      "select * from products",
      function(err, res){
        if(err){
          reject(error);
        }
        // reports how many rows are affected
        // console.log(res.affectedRows);
        // console.log(res);
        resolve(res);

      }
    );
  });
}
