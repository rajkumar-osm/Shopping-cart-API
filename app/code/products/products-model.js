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

function ProductsModel(app) {
  AppModel.call(this);
}

util.inherits(ProductsModel, AppModel);

// Your code starts here.

ProductsModel.prototype.getProducts = function (options, cb) {
  var that = this;
  var sqlQuery = ' SELECT ' +
    ' p.product_id AS productId , ' +
    ' p.product_name AS productName , ' +
    ' p.unit_price AS unitPrice ' +
    ' FROM products p;';
  this.getResults({
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
      return cb(null, queryResult);
    }
  });
};

ProductsModel.prototype.addProduct = function (product, cb) {
  var that = this;
  var invalidParams = this.isValid(product, ['productName', 'unitPrice']);
  if (invalidParams.length > 0) {
    cb(new AppError(that.getStatusCode('badRequest'), __CONFIG__.api_response_messages.common_validation_err_message, invalidParams));
    return;
  }
  var sqlQuery = 'INSERT INTO products(`product_name`, `unit_price`) VALUES (?,?)';
  var data = [product.productName, product.unitPrice];
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
};

ProductsModel.prototype.removeProduct = function (product, cb) {
  var that = this;
  var invalidParams = this.isValid(product, ['productId']);
  if (invalidParams.length > 0) {
    cb(new AppError(that.getStatusCode('badRequest'), __CONFIG__.api_response_messages.common_validation_err_message, invalidParams));
    return;
  }
  var sqlQuery = 'DELETE FROM products where product_id = ?;';
  var data =
    this.query({
      query: sqlQuery,
      data: product.productId,
      validate: true,
      cb: function (err, data) {
        if (err) {
          return cb(err);
        }
        return cb(null, data);
      }
    });
};

ProductsModel.prototype.updateProduct = function (product, cb) {
  var that = this;
  var invalidParams = this.isValid(product, ['productId', 'productName', 'unitPrice']);
  if (invalidParams.length > 0) {
    cb(new AppError(that.getStatusCode('badRequest'), __CONFIG__.api_response_messages.common_validation_err_message, invalidParams));
    return;
  }
  var sqlQuery = 'UPDATE products SET product_name= ? , unit_price = ? WHERE product_id = ?;';
  var data = [product.productName, product.unitPrice, product.productId];
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
};

// Parameter Validations
var validProductData = {
  'productId': {
    "type": "number",
    "db_name": "product_id"
  },
  'productName': {
    "type": "string",
    "db_name": "product_name"
  },
  'unitPrice': {
    "type": "number",
    "db_name": "unit_price"
  }
};

ProductsModel.prototype.isValid = function (pReceivedParams, pRequired) {
  var invalidParams = [];
  for (var i = 0; i < pRequired.length; i++) {
    if (pReceivedParams[pRequired[i]] == undefined || typeof pReceivedParams[pRequired[i]] != validProductData[pRequired[i]].type) {
      invalidParams.push(pRequired[i]);
    }
  }
  return invalidParams;
}

module.exports = ProductsModel;