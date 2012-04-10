/*!
 * Copyright(c) 2012 Matias Meno <m@tias.me>
 */

/**
 * In addition to the normal data types, the data-proxy also supports the checked types which are in fact normal data
 * types but give the certainty that the value is not just injected by a POST form but generated in code.
 * 
 * This is relevant for ids that should only be available for logged in users for example.
 */

/**
 * The parent class of all checked types.
 * @type {Function}
 */
var CheckedType = function() { };

/**
 * Expose CheckedType
 * @type {CheckedType}
 */
exports.Type = CheckedType;

/**
 * Constructor for CheckedString
 * @param {String} __value__
 */
var CheckedString = function(__value__) {
  if (typeof __value__ !== "string") throw new Error("CheckedString has to be provided with a String.");
  this.__value__ = __value__;
}
/**
 * Subclass CheckedType
 * @type {CheckedType}
 */
CheckedString.prototype = new CheckedType();
/**
 * toString() and valueOf() are the same for a checkedString
 * @var {Function}
 */
CheckedString.prototype.toString = CheckedString.prototype.valueOf = function() { return this.__value__; };
/**
 * Exposing CheckedString
 * @type {CheckedString}
 */
exports.String = CheckedString;


/**
 * Constructor for CheckedNumber
 * @param  {Number} __value__
 */
var CheckedNumber = function(__value__) {
  if (typeof __value__ !== "number") throw new Error("CheckedNumber has to be provided with a Number.");
  this.__value__ = __value__;
}
/**
 * Subclass CheckedType
 * @type {CheckedType}
 */
CheckedNumber.prototype = new CheckedType();
/**
 * @var {Function}
 */
CheckedNumber.prototype.toString = function() { return this.__value__.toString(); };
/**
 * @var {Function}
 */
CheckedNumber.prototype.valueOf = function() { return this.__value__; };
/**
 * Exposing CheckedNumber
 * @type {CheckedNumber}
 */
exports.Number = CheckedNumber;

