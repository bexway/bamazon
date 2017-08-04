# bamazon
A Node and SQL application to create a product database and allow customer interaction through a CLI.

## Database
The data is stored in an SQL database, seeded through the `bamazonSeed.sql` file. It contains two tables: a `products` table listing the products for sale, and a `departments` table listing the departments. Each product in the `product` table is listed with its `item_id` (auto-generated integer), `product_name` (string), `department_name` (string), `price` (float), and `stock_quantity` (integer). Each department in the `department` table is listed with its `department_id` (auto-generated integer), `department_name` (string), and `over_head_costs` (float).

## Customer Interface
The `customer.js` file runs the customer interface. The products available for purchase are listed using the [Inquirer package](https://www.npmjs.com/package/inquirer), and the customer can choose which to purchase and how many of that item they would like. If the quantity being purchased exceeds the quantity in stock, the order will be declined, and the customer will return to the product listing page to make a different purchase. Each successful purchase will update the available quantity and the product sales of that product in the database.

![alt text][customerInterface]

## Employee Interfaces

There are two Employee interfaces, run through the `employee.js` file. Each is built off a `BamazonEmployee` constructor, which maintains properties and functions used by both types of employee (e.g. the connection to the SQL database). Both the `manager` and `supervisor` objects are instances of the `BamazonEmployee` constructor, with functions specific to their instances added to them.

They are both run through the `employee.js` file. To run the supervisor interface, add `supervisor` as the next argument (i.e. `node employee.js supervisor`)

###Manager

The Manager interface allows for four commands: Viewing all products, viewing low-inventory products, adding to the inventory of a product, and adding a new product.

#### Viewing products

There are two commands for viewing available products. The `View products for sale` command will display all of the products available for purchase. The `View low inventory` command will show all items with fewer than 5 units in stock.

![alt text][viewInventory]

#### Adding to inventory

To restock an item's inventory, the manager must select the `Add to inventory` command, choose the item to restock, and indicate the number of units to restock.

![alt text][addToInventory]

#### Adding a product

To add a new product to the list of available products, the manager must select the `Add new product` command and describe the product. They will be prompted for the name, department, price, and quantity of the new item.

![alt text][addProduct]

###Supervisor

The supervisor has two commands: viewing the product sales by department, and creating a new department. When creating a new department, the supervisor must specify the name and overhead costs of the department.

When viewing the product sales, the user will see a table listing each department in order of ID, along with the department name, the overhead costs, the amount made by sales of products in that department, and the total profit (the product sales with the overhead costs subtracted).

Only departments that are listed in the departments table will be included in the product sales graph. If there are no products in that department, their product sales and total profits will be listed as N/A. If a product is in a department that is not in the departments table, that department will not be listed in the table.
![alt text][supervisorFunctionality]

## Goals

I would like to incorporate the customer interface into a constructor similar to the BamazonEmployee constructor, since it uses the same connection function, as well as the same logging function.

Additionally, I would like each interface to be a constructor inheriting from the BamazonEmployee prototype so that creating instances of managers or supervisors would be simpler.

[customerInterface]: https://farm5.staticflickr.com/4305/36203482611_10530f3e92_z.jpg "Customer interface: the customer chooses an item to purchase, indicates the quantity to purchase"
[viewInventory]: https://farm5.staticflickr.com/4314/36203484871_86a14469f0_z.jpg "Viewing the Inventory: the manager can choose to see all available products, or to see the products with fewer than 5 items in stock"
[supervisorFunctionality]: https://farm5.staticflickr.com/4411/35523837904_1f9d6b4a5f.jpg "Adding a department: the supervisor is prompted to name the new department and specify its overhead costs, and it will appear in the table of product sales by department"
[addToInventory]: https://farm5.staticflickr.com/4407/36203470891_37db90bc88_z.jpg "Adding to Inventory: the manager can choose a product to restock it with a chosen number of units"
[addProduct]: https://farm5.staticflickr.com/4406/35531349153_16bc18c185.jpg "Adding a product: the manager can add a new product by specifying its name, department, price, and stock"
