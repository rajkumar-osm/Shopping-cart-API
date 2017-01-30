/* global __CONFIG__ */
'use strict';

// Third party modules
var fs = require('fs');
var async = require('async');
var util = require('util');

// Internal modules
var AppModel = require(__CONFIG__.app_code_path + 'app-model.js');
var AppError = require(__CONFIG__.app_lib_path + 'app-error.js');
var GetStatus = require(__CONFIG__.app_lib_path + 'status.js');

function ShoppingCartModel(app) {
  AppModel.call(this);
}

util.inherits(ShoppingCartModel, AppModel);

// Your code starts here.
ShoppingCartModel.prototype.getMyCart = function (options, cb) {
  var that = this;
  var sqlQuery = ' SELECT ' +
    ' sc.cart_item_id AS cartItemId , ' +
    ' sc.product_id AS productId , ' +
    ' p.product_name AS productName , ' +
    ' p.unit_price AS unitPrice , ' +
    ' sc.quantity AS quantity ' +
    ' FROM shopping_cart sc INNER JOIN products p ON sc.product_id = p.product_id;';
  this.getResults({
    query: sqlQuery,
    data: null,
    isGrid: true,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
        err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return cb(null, queryResult);
    }
  });
};

ShoppingCartModel.prototype.addItemToCart = function (item, cb) {
  var that = this;
  var invalidParams = this.isValid(item, ['productId', 'quantity']);
  if (invalidParams.length > 0) {
    cb(new AppError(that.getStatusCode('badRequest'), __CONFIG__.api_response_messages.common_validation_err_message, invalidParams));
    return;
  }
  // I am checking if the same item already existing in the cart, I am just increasing it's quantity.
  // If the item is not there in the cart, then I am adding it to the cart.
  var sqlQuery = 'SELECT quantity from shopping_cart where product_id = ?';
  this.query({
    query: sqlQuery,
    data: item.productId,
    validate: true,
    cb: function (err, data) {
      if (err) {
        return cb(err);
      }
      return resultSetCb(data);
    }
  });

  function resultSetCb(data) {
    if (data.length > 0) {
      sqlQuery = 'UPDATE shopping_cart SET quantity = ? WHERE product_id = ?';
      var currentQuantity = data[0].quantity;
      var updatedQuantity = currentQuantity + item.quantity;
      var data = [updatedQuantity, item.productId];
    } else {
      sqlQuery = 'INSERT INTO shopping_cart (`product_id`, `quantity`) VALUES (?,?)';
      var data = [item.productId, item.quantity];
    }
    that.query({
      query: sqlQuery,
      data: data,
      validate: true,
      cb: function (err, data) {
        if (err) {
          return cb(err);
        }
        return cb(null, data);
      }
    });
  }
}

ShoppingCartModel.prototype.removeCartItem = function (item, cb) {
  var that = this;
  var invalidParams = this.isValid(item, ['cartItemId']);
  if (invalidParams.length > 0) {
    cb(new AppError(that.getStatusCode('badRequest'), __CONFIG__.api_response_messages.common_validation_err_message, invalidParams));
    return;
  }
  var sqlQuery = 'DELETE FROM shopping_cart where cart_item_id = ?;';
  var data =
    this.query({
      query: sqlQuery,
      data: item.cartItemId,
      validate: true,
      cb: function (err, data) {
        if (err) {
          return cb(err);
        }
        return cb(null, data);
      }
    });
}

ShoppingCartModel.prototype.updateCartItem = function (item, cb) {
  var that = this;
  var invalidParams = this.isValid(item, ['cartItemId', 'quantity']);
  if (invalidParams.length > 0) {
    cb(new AppError(that.getStatusCode('badRequest'), __CONFIG__.api_response_messages.common_validation_err_message, invalidParams));
    return;
  }
  var sqlQuery = 'UPDATE shopping_cart SET quantity = ? WHERE cart_item_id = ?';
  var data = [item.quantity, item.cartItemId];
  this.query({
    query: sqlQuery,
    data: data,
    validate: true,
    cb: function (err, data) {
      if (err) {
        return cb(err);
      }
      return cb(null, data);
    }
  });
}

ShoppingCartModel.prototype.getCartTotal = function (options, cb) {
  var that = this;
  // Here I am calculating total price by doing inner join for both 'products' table and 'shopping_cart' table.
  var sqlQuery = ' SELECT ' +
    ' sc.cart_item_id AS cartItemId , ' +
    ' sc.product_id AS productId , ' +
    ' p.product_name AS productName , ' +
    ' p.unit_price AS unitPrice , ' +
    ' sc.quantity AS quantity ' +
    ' FROM shopping_cart sc INNER JOIN products p ON sc.product_id = p.product_id;';
  this.getResults({
    query: sqlQuery,
    data: null,
    isGrid: true,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
        err = new AppError(that.getStatusCode('notFound'),  __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return calculateTotal(queryResult);
    }
  });
  
  function calculateTotal(queryResult) {
    var total = 0;
    for (var i = 0; i < queryResult.length; i++) {
      total += queryResult[i].unitPrice * queryResult[i].quantity;
    }
    cb(null, { 'totalCartAmount': total });
  }
}

ShoppingCartModel.prototype.checkoutCart = function (userDetails, cb) {
  var that = this;
  var invalidParams = this.isValid(userDetails, ['userName', 'phoneNumber', 'gender', 'email']);
  if (invalidParams.length > 0) {
    cb(new AppError(that.getStatusCode('badRequest'), __CONFIG__.api_response_messages.common_validation_err_message, invalidParams));
    return;
  }
  that.getCartTotal(null, function (err, data) {
    if (data.totalCartAmount == 0) {
      cb(new AppError(that.getStatusCode('notFound'), __CONFIG__.api_response_messages.empty_cart_msg));
      return;
    }
    var sqlQuery = 'INSERT INTO checkouts(`user_name`, `phone_number`, `gender`, `email_id`, `purchased_total`) VALUES (?,?,?,?,?)';
    var data = [userDetails.userName, userDetails.phoneNumber, userDetails.gender, userDetails.email, data.totalCartAmount];
    that.query({
      query: sqlQuery,
      data: data,
      validate: true,
      cb: function (err, data) {
        if (err) {
          return cb(err);
        }
        return checkoutSuccessCb(data);
      }
    });
    // When there is a checkout happens, I am clearing the 'shopping_cart' table as the previous cart items are purchased.
    function checkoutSuccessCb(data) {
      sqlQuery = 'TRUNCATE TABLE shopping_cart;';
      that.query({
        query: sqlQuery,
        data: null,
        validate: true,
        cb: function (err, data) {
          if (err) {
            return cb(err);
          }
          return cb(null, data);
        }
      });
    }
  });
}

ShoppingCartModel.prototype.getTotalSales = function (options, cb) {
  var that = this;
  var sqlQuery = ' SELECT ' +
    ' c.checkout_id AS checkoutId , ' +
    ' c.user_name AS userName , ' +
    ' c.purchased_total AS purchasedTotal , ' +
    ' c.email_id AS email ' +
    ' FROM checkouts c;';
  that.getResults({
    query: sqlQuery,
    data: null,
    isGrid: true,
    cb: function (err, queryResult) {
      if (!err && !queryResult) {
        err = new AppError(that.getStatusCode('notFound'), __CONFIG__.api_response_messages.common_no_results_found_msg, {});
      }
      if (err) {
        return cb(err);
      }
      return calculateTotalSales(queryResult);
    }
  });

  function calculateTotalSales(queryResult) {
    var totalSales = 0;
    for (var i = 0; i < queryResult.length; i++) {
      totalSales += queryResult[i].purchasedTotal;
    }
    cb(null, { 'totalSales': totalSales });
  }
}

// Parameter Validations
var validData = {
  'productId': {
    "type": "number",
    "db_name": "product_id"
  },
  'cartItemId': {
    "type": "number",
    "db_name": "cart_item_id"
  },
  'quantity': {
    "type": "number",
    "db_name": "quantity"
  },
  'userName': {
    "type": "string",
    "db_name": "user_name"
  },
  'phoneNumber': {
    "type": "number",
    "db_name": "phone_number"
  },
  'gender': {
    "type": "number",
    "db_name": "gender"
  },
  'email': {
    "type": "string",
    "db_name": "email_id"
  }
};

ShoppingCartModel.prototype.isValid = function (pReceivedParams, pRequired) {
  var invalidParams = [];
  for (var i = 0; i < pRequired.length; i++) {
    if (pReceivedParams[pRequired[i]] == undefined || typeof pReceivedParams[pRequired[i]] != validData[pRequired[i]].type) {
      invalidParams.push(pRequired[i]);
    }
  }
  return invalidParams;
}

module.exports = ShoppingCartModel;