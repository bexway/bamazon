var mysql = require("mysql");
var inquirer = require("inquirer");
var passwordFile = require("./password.js");
var Table = require('cli-table');

function BamazonEmployee(){
  this.connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: 'root',
    password: passwordFile.password,
    database: 'bamazonDB'
  });
}

BamazonEmployee.prototype.makeConnection = function(connection){
  return new Promise(function(resolve, reject) {
    connection.connect(function(error){
      if(error) reject(error);
      resolve("connected as id "+connection.threadId);
    });
  });
};

BamazonEmployee.prototype.promptMenu = function(options){
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

BamazonEmployee.prototype.prettifyProductList = function(productList){
  var products = [];
  for(var r in productList){
    products.push(productList[r].product_name+" - $"+productList[r].price+" ("+productList[r].stock_quantity+" in stock)");
  }
  return products;
};

BamazonEmployee.prototype.printPrettyProducts = function(productsList){
  var prettyProducts = manager.prettifyProductList(productsList);
  for(var p in prettyProducts){
    console.log(prettyProducts[p]);
  }
};


//DEFINING THE MANAGER SPECIFIC FUNCTIONS

var manager = new BamazonEmployee();
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

        manager.promptProductList(prettyProducts).then(function(response){
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
      manager.promptNewProductInfo().then(function(response){
        manager.createProduct(manager.connection, response);
        //the manager.init function is within the callback in the createProduct function
      });
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

manager.promptProductList = function(products){
  return inquirer
    .prompt(
      {
        name: "product",
        type: "list",
        message: "What would you like to restock?:",
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
        message: "How many would you like to purchase? (Please enter an integer):",
        validate: function(input){
          return !isNaN(input);
        }
      }
    );
};

manager.promptNewProductInfo = function(){
  return inquirer
    .prompt([
      {
        name: "product_name",
        type: "input",
        message: "What is the name of your product?:",
      },
      {
        name: "department_name",
        type: "input",
        message: "What department is your product in?:",
      },
      {
        name: "price",
        type: "input",
        message: "How much does your item cost?: $",
        validate: function(input){
          return !isNaN(input);
        }
      },
      {
        name: "quantity",
        type: "input",
        message: "How many do you have in stock?:",
        validate: function(input){
          return !isNaN(input);
        }
      }
    ]
    );
};

manager.createProduct = function(connection, productInfo){
    var query = connection.query(
      // ? fills in with the following argument
      "insert into products set ?",
      {
        product_name: productInfo.product_name,
        department_name: productInfo.department_name,
        price: productInfo.price,
        stock_quantity: stock_quantity,
      },
      function(err, res){
        console.log("Thanks! Your item has been listed.");
        manager.init();
      }
    );
};



//CREATE SUPERVISOR SPECIFIC OBJECT
var supervisor = new BamazonEmployee();
supervisor.options = ["View product sales by department", "Create new Department", "Quit"];

supervisor.init = function(){
  this.promptMenu(this.options).then(function(response){
    if(response.response == "View product sales by department"){
      supervisor.displaySalesByDepartment(supervisor.connection).then(function(response){
        var table = new Table({
          head: ['Department ID', 'Department Name', 'Overhead Costs', 'Product Sales', 'Total Profit'], colWidths: [25, 25, 25, 25, 25]
        });

        for(var dept in response){
          var tempList = [];
          for(var col in response[dept]){
            tempList.push(response[dept][col]);
          }
          table.push(tempList);
        }

        console.log(table.toString());
        supervisor.init();
      });
    }
    else if (response.response == "Create new Department") {
      supervisor.promptNewDepartmentInfo().then(function(response){
        supervisor.createDepartment(supervisor.connection, response);
      });
    }
    else{
      supervisor.connection.end();
    }
  });
};

supervisor.displaySalesByDepartment = function(connection){
  return new Promise(function(resolve, reject) {
    var query = connection.query(
      "SELECT d.department_id, d.department_name, d.over_head_costs, sum(p.product_sales), (sum(p.product_sales)-d.over_head_costs) AS total_profit FROM departments d INNER JOIN products p ON (p.department_name = d.department_name) GROUP BY p.department_name ORDER BY d.department_id",
      function(err, res){
        if(err){
          reject(error);
        }
        resolve(res);

      }
    );
  });
};

supervisor.createDepartment = function(connection, departmentInfo){
    var query = connection.query(
      // ? fills in with the following argument
      "insert into departments set ?",
      {
        department_name: departmentInfo.department_name,
        over_head_costs: departmentInfo.over_head_costs,
      },
      function(err, res){
        console.log("Thanks! Your department has been created.");
        supervisor.init();
      }
    );
};

supervisor.promptNewDepartmentInfo = function(){
  return inquirer
    .prompt([
      {
        name: "department_name",
        type: "input",
        message: "What department is your product in?:",
      },
      {
        name: "over_head_costs",
        type: "input",
        message: "What is the overhead cost of your department?: $",
        validate: function(input){
          return !isNaN(input);
        }
      }
    ]
    );
};


















//RUN THE ACTUAL PROMPTS
// manager.makeConnection(manager.connection)
// .then(function(message){
//   console.log(message);
//   manager.init();
// })
// .catch(function(error){
//   console.log(error);
// });

supervisor.makeConnection(supervisor.connection)
.then(function(message){
  console.log(message);
  supervisor.init();
})
.catch(function(error){
  console.log(error);
});
