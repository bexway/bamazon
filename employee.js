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

bamazonEmployee.prototype.prettifyProductList = function(productList){
  var products = [];
  for(var r in productList){
    products.push("Product "+productList[r].item_id+" in the "+productList[r].department_name+" department: "+productList[r].product_name+" - $"+productList[r].price+" ("+productList[r].stock_quantity+" in stock)");
  }
  return products;
};

bamazonEmployee.prototype.printPrettyProducts = function(productsList){
  var prettyProducts = manager.prettifyProductList(productsList);
  for(var p in prettyProducts){
    console.log(prettyProducts[p]);
  }
};


//DEFINING THE MANAGER SPECIFIC FUNCTIONS

var manager = new bamazonEmployee();
manager.options = ["View products for sale", "View low inventory", "Add to Inventory", "Add new product", "Quit"];

manager.init = function(){
  this.promptMenu(this.options).then(function(response){
    if(response.response == "View products for sale"){
      manager.retrieveProducts(manager.connection).then(function(productsList){
        console.log("PRODUCTS FOR SALE:");
        manager.printPrettyProducts(productsList);
        manager.init();
      });
    }
    else if (response.response == "View low inventory") {
      manager.displayLowInventory(manager.connection).then(function(productsList){
        console.log("PRODUCTS WITH LOW STOCK:");
        manager.printPrettyProducts(productsList);
        manager.init();
      });
    }
    else if (response.response == "Add to Inventory") {
      manager.retrieveProducts(manager.connection).then(function(response){
        var prettyProducts = manager.prettifyProductList(response);
        var products = response;

        manager.promptProduct(prettyProducts).then(function(response){
          var currentProduct = products[prettyProducts.indexOf(response.product)];

          var productId = currentProduct.item_id;
          var stockQuantity = currentProduct.stock_quantity;
          // console.log(quantity);
          manager.promptQuantity().then(function(response){
            manager.restockProduct(manager.connection, productId, parseInt(response.quantity)+ parseInt(stockQuantity))
            .then(function(message){
              console.log(message);
              manager.init();
            });
          });
        });

      });
    }
    else if (response.response == "Add new product") {
      console.log("new product")
    }
    else{
      manager.connection.end();
    }
  });
};

manager.retrieveProducts = function(connection){
  return new Promise(function(resolve, reject) {
    var query = connection.query(
      // ? fills in with the following argument
      "SELECT * FROM products",
      function(err, res){
        if(err){
          reject(error);
        }
        resolve(res);

      }
    );
  });
};

manager.displayLowInventory = function(connection){
  return new Promise(function(resolve, reject) {
    var query = connection.query(
      // ? fills in with the following argument
      "SELECT * FROM products WHERE stock_quantity<5",
      function(err, res){
        if(err){
          reject(error);
        }
        resolve(res);

      }
    );
  });
};

manager.restockProduct = function(connection, productId, stockQuantity){
  return new Promise(function(resolve, reject) {
    var query = connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: stockQuantity
        },
        {
          item_id: productId
        },
      ],
      function(err, res){
        if(err) reject(err);
        resolve("Thanks for your purchase! Product "+productId+" now has "+stockQuantity+" units in stock.");
      }
    );
  });
};

manager.promptProduct = function(products){
  return inquirer
    .prompt(
      {
        name: "product",
        type: "list",
        message: "What would you like to restock?",
        choices: products
      }
    );
};

manager.promptQuantity = function(){
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
};




//RUN THE ACTUAL MANAGER PROMPT
manager.makeConnection(manager.connection)
.then(function(message){
  console.log(message);
  manager.init();
})
.catch(function(error){
  console.log(error);
});
