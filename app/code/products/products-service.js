/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var AppService = require(__CONFIG__.app_code_path + 'app-service.js');
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var ProductsModel = require(__CONFIG__.app_code_path + 'products/products-model.js');

function ProductsService(app) {  
  AppService.call(this);     
}

util.inherits(ProductsService, AppService);

// Your code starts here.
ProductsService.prototype.getProducts = function (options, cb) {
  var mProducts = new ProductsModel();
  mProducts.getProducts(null, cb);
};

ProductsService.prototype.addProduct = function (product, cb) {
  var mProducts = new ProductsModel();
  mProducts.addProduct(product, cb);
};

ProductsService.prototype.removeProduct = function (productId, cb) {
  var mProducts = new ProductsModel();
  mProducts.removeProduct(productId, cb);
};

ProductsService.prototype.updateProduct = function (product, cb) {
  var mProducts = new ProductsModel();
  mProducts.updateProduct(product, cb);
};

module.exports = ProductsService;