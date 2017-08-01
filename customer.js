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
  customerStart();

});

function customerStart(){
  displayProducts().then(function(res){
    var products = [];
    for(var r in res){
      products.push("Product "+res[r].item_id+": "+res[r].product_name+" - $"+res[r].price+" ("+res[r].stock_quantity+" in stock)");
    }
    products.push("Quit without purchasing");
    promptProduct(products).then(function(response){
      if(response.product == "Quit without purchasing"){
        console.log("Bye!");
        connection.end();
        return;
      }
      else{
        // console.log(response);
        var purchaseName = /Product \d*\:/.exec(response.product)[0];
        var purchaseId = purchaseName.slice(8, purchaseName.length-1);
        var stockName = /\(\d* in stock\)/.exec(response.product)[0];
        var stockQuantity = stockName.slice(1, stockName.length-10);
        // console.log(quantity);
        promptQuantity().then(function(response){
          makePurchase(purchaseId, parseInt(response.quantity), parseInt(stockQuantity))
          .then(function(){
            updateProduct(parseInt(purchaseId), parseInt(response.quantity), parseInt(stockQuantity));
          })
          .catch(function(){
            console.log("Insufficient quantity available! Please make a different purchase:");
            customerStart();
          });
        });
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

function makePurchase(purchasedProduct, purchaseQuantity, stockQuantity){
  return new Promise(function(resolve, reject) {
    //check if in stock_quantity
    if(purchaseQuantity>stockQuantity){
      reject();
    } else{
      // updateProduct(purchasedProduct, purchaseQuantity, stockQuantity);
      resolve();
    }
    //if too low, abort and error,
    //otherwise, run updateProduct
  });

}

function updateProduct(purchasedProduct, purchaseQuantity, stockQuantity){
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: stockQuantity - purchaseQuantity
      },
      {
        item_id: purchasedProduct
      },
    ],
    function(err, res){
      if(err) throw err;
      customerStart();
    }
  );
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
