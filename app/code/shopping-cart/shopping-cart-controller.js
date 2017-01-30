/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');
var AppController = require(__CONFIG__.app_code_path + 'app-controller.js');
var ShoppingCartService = require(__CONFIG__.app_code_path + 'shopping-cart/shopping-cart-service.js');

function ShoppingCartController(app) {
  AppController.call(this);

  app.httpGet({
    url: '/getMyCart',
    route: this.getMyCart.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/addItemToCart',
    route: this.addItemToCart.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/removeCartItem',
    route: this.removeCartItem.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/updateCartItem',
    route: this.updateCartItem.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpGet({
    url: '/getCartTotal',
    route: this.getCartTotal.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpPost({
    url: '/checkoutCart',
    route: this.checkoutCart.bind(this),
    isPublic: true,
    isAdmin: false
  });

  app.httpGet({
    url: '/getTotalSales',
    route: this.getTotalSales.bind(this),
    isPublic: true,
    isAdmin: false
  });
}

util.inherits(ShoppingCartController, AppController);

// Your code starts here.
/*
  name: getMyCart
  desc: It returns list of items that are there in the shopping cart.
*/
ShoppingCartController.prototype.getMyCart = function (request, response) {
  var that = this;
  var sShoppingCart = new ShoppingCartService();
  sShoppingCart.getMyCart(null, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: addItemToCart
  desc: It is to add an item/product to the cart.
*/
ShoppingCartController.prototype.addItemToCart = function (request, response) {
  var that = this;
  var sShoppingCart = new ShoppingCartService();
  var product = {
    productId: request.body.productId,
    quantity: request.body.quantity,
  }
  sShoppingCart.addItemToCart(product, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    if (data.affectedRows) {
      data = {
        message: __CONFIG__.api_response_messages.cart_add_success
      }
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: removeCartItem
  desc: It is to remove an item/product from the cart.
*/
ShoppingCartController.prototype.removeCartItem = function (request, response) {
  var that = this;
  var sShoppingCart = new ShoppingCartService();
  var item = {
    cartItemId : request.body.cartItemId
  }
  sShoppingCart.removeCartItem(item, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    if (data.affectedRows) {
      data = {
        message: __CONFIG__.api_response_messages.cart_remove_success
      }
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: updateCartItem
  desc: It is to update an item details in the cart.
*/
ShoppingCartController.prototype.updateCartItem = function (request, response) {
  var that = this;
  var sShoppingCart = new ShoppingCartService();
  var item = {
    cartItemId: request.body.cartItemId,
    quantity: request.body.quantity
  }
  sShoppingCart.updateCartItem(item, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    if (data.affectedRows) {
      data = {
        message: __CONFIG__.api_response_messages.cart_update_success
      }
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: getCartTotal
  desc: It returns the total amount of all items in the cart.
*/
ShoppingCartController.prototype.getCartTotal = function (request, response) {
  var that = this;
  var sShoppingCart = new ShoppingCartService();
  sShoppingCart.getCartTotal(null, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: checkoutCart
  desc: Here it records the user purchase and clears the current cart.
*/
ShoppingCartController.prototype.checkoutCart = function (request, response) {
  var that = this;
  var sShoppingCart = new ShoppingCartService();
  var user = {
    userName: request.body.userName,
    phoneNumber: request.body.phoneNumber,
    gender: request.body.gender,
    email: request.body.email
  };
  sShoppingCart.checkoutCart(user, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    if (data) {
      data = {
        message: __CONFIG__.api_response_messages.cart_checkout_success
      }
    }
    that.sendResponse(null, data, response);
  });
}

/*
  name: getTotalSales
  desc: It returns the total amount of purchases happened till now.
*/
ShoppingCartController.prototype.getTotalSales = function (request, response) {
  var that = this;
  var sShoppingCart = new ShoppingCartService();
  sShoppingCart.getTotalSales(null, function (err, data) {
    if (err) {
      that.sendResponse(err, data, response);
      return;
    }
    that.sendResponse(null, data, response);
  });
}

module.exports = ShoppingCartController;