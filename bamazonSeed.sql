DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (item_id)
);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("product1", "department1", 5.5,  100), ("product2", "department2", 565,  101), 
("product3", "department3", 7.5,  102), ("product6", "department3", 7.5,  4);

SELECT * from products;

SELECT * FROM products WHERE stock_quantity<5;