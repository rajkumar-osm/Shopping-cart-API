/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var AppService = require(__CONFIG__.app_code_path + 'app-service.js');
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var ShoppingCartModel = require(__CONFIG__.app_code_path + 'shopping-cart/shopping-cart-model.js');

function ShoppingCartService(app) {
  AppService.call(this);
}

util.inherits(ShoppingCartService, AppService);

// Your code starts here.
ShoppingCartService.prototype.getMyCart = function (options, cb) {
  var mShoppingCart = new ShoppingCartModel();
  mShoppingCart.getMyCart(options, cb);
};

ShoppingCartService.prototype.addItemToCart = function (item, cb) {
  var mShoppingCart = new ShoppingCartModel();
  mShoppingCart.addItemToCart(item, cb);
};

ShoppingCartService.prototype.removeCartItem = function (cartItemId, cb) {
  var mShoppingCart = new ShoppingCartModel();
  mShoppingCart.removeCartItem(cartItemId, cb);
};

ShoppingCartService.prototype.updateCartItem = function (item, cb) {
  var mShoppingCart = new ShoppingCartModel();
  mShoppingCart.updateCartItem(item, cb);
};

ShoppingCartService.prototype.getCartTotal = function (options, cb) {
  var mShoppingCart = new ShoppingCartModel();
  mShoppingCart.getCartTotal(null, cb);
};

ShoppingCartService.prototype.checkoutCart = function (userDetails, cb) {
  var mShoppingCart = new ShoppingCartModel();
  mShoppingCart.checkoutCart(userDetails, cb);
};

ShoppingCartService.prototype.getTotalSales = function (options, cb) {
  var mShoppingCart = new ShoppingCartModel();
  mShoppingCart.getTotalSales(null, cb);
};
module.exports = ShoppingCartService;