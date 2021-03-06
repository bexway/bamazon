DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  product_sales INT DEFAULT 0,
  PRIMARY KEY (item_id)
);

CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(100) NULL,
  over_head_costs DECIMAL(10,2) NULL,
  PRIMARY KEY (department_id)
);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Computer", "Electronics", 5.5,  100), ("Shirt", "Clothing", 565,  101), 
("Pants", "Clothing", 7.5,  102), ("Apple", "Grocery", 7.5,  4), ("Lego", "Toys", 7.5,  4);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Electronics", 60), ("Clothing", 700), ("Grocery", 150), ("House", 500);

SELECT * FROM departments;

SELECT * FROM products;

SELECT d.department_id, d.department_name, d.over_head_costs, sum(p.product_sales), (sum(p.product_sales)-d.over_head_costs) as total_profit 
from departments d LEFT JOIN products p on (p.department_name = d.department_name) group by d.department_name;