/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var AppController = require(__CONFIG__.app_code_path + 'app-controller.js');
var ProductsService = require(__CONFIG__.app_code_path + 'products/products-service.js');

function ProductsController(app) {
  AppController.call(this);

  app.httpGet({
    url: '/getProducts',
    route: this.getProducts.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/addProduct',
    route: this.addProduct.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/removeProduct',
    route: this.removeProduct.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPut({
    url: '/updateProduct',
    route: this.updateProduct.bind(this),
    isPublic: true,
    isAdmin: false
  });
}

util.inherits(ProductsController, AppController);

// Your code starts here.

/*
  name: getProducts
  description: This function returns a total list of products existing in the system.
*/
ProductsController.prototype.getProducts = function (request, response) {
  var that = this;
  var sProducts = new ProductsService();
  sProducts.getProducts(null, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: addProduct
  description: This function adds a product to the existing product list.
*/
ProductsController.prototype.addProduct = function (request, response) {
  var that = this;
  var sProducts = new ProductsService();
  var product = {
    productName: request.body.productName,
    unitPrice: request.body.unitPrice
  }
  sProducts.addProduct(product, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    if (data.affectedRows) {
      data = {
        productId: data.insertId,
        message: __CONFIG__.api_response_messages.insert_success
      }
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: removeProduct
  description: This function removes a product from the current list.
*/
ProductsController.prototype.removeProduct = function (request, response) {
  var that = this;
  var sProducts = new ProductsService();
  var product = {
    productId: request.body.productId
  };
  sProducts.removeProduct(product, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    data = {
      message: __CONFIG__.api_response_messages.remove_success
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: updateProduct
  description: This function updates product information of an existing product.
*/
ProductsController.prototype.updateProduct = function (request, response) {
  var that = this;
  var product = {
    productId: request.body.productId,
    productName: request.body.productName,
    unitPrice: request.body.unitPrice
  }
  var sProducts = new ProductsService();
  sProducts.updateProduct(product, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    if (data.affectedRows) {
      data = {
        message: __CONFIG__.api_response_messages.update_success
      }
    }
    that.sendResponse(null, data, response);
  });
}

module.exports = ProductsController;