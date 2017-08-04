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
  // console.log("connected as id "+connection.threadId);
  customerStart();

});

function prettifyProductList(productList){
  var products = [];
  for(var r in productList){
    products.push(productList[r].product_name+" - $"+productList[r].price+" ("+productList[r].stock_quantity+" in stock)");
  }
  return products;
}

function printPrettyProducts(productsList){
  var prettyProducts = prettifyProductList(productsList);
  for(var p in prettyProducts){
    console.log(prettyProducts[p]);
  }
}

function customerStart(){
  displayProducts().then(function(response){
    var prettyProducts = prettifyProductList(response);
    var products = response;
    prettyProducts.push("Quit without purchasing");
    promptProduct(prettyProducts).then(function(response){
      if(response.product == "Quit without purchasing"){
        console.log("Bye!");
        connection.end();
        return;
      }
      else{
        var currentProduct = products[prettyProducts.indexOf(response.product)];

        var productId = currentProduct.item_id;
        var stockQuantity = currentProduct.stock_quantity;
        promptQuantity().then(function(response){
          makePurchase(currentProduct, parseInt(response.quantity))
          .then(function(){
            updateProduct(currentProduct, parseInt(response.quantity));
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

function makePurchase(currentProduct, purchaseQuantity){
  return new Promise(function(resolve, reject) {
    //check if in stock_quantity
    if(purchaseQuantity>currentProduct.stock_quantity){
      reject();
    } else{
      resolve();
    }
  });

}

function updateProduct(currentProduct, purchaseQuantity){
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: currentProduct.stock_quantity - purchaseQuantity
      },
      {
        item_id: currentProduct.item_id
      },
    ],
    function(err, res){
      if(err) throw err;
      tallySales(currentProduct, purchaseQuantity);
    }
  );
}

function tallySales(currentProduct, purchaseQuantity){
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        product_sales: currentProduct.product_sales + (purchaseQuantity*currentProduct.price)
      },
      {
        item_id: currentProduct.item_id
      },
    ],
    function(err, res){
      if(err) throw err;
      console.log("Thanks for your purchase of "+purchaseQuantity+ " "+currentProduct.product_name);
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
