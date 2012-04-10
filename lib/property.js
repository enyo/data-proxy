/*!
 * Copyright(c) 2012 Matias Meno <m@tias.me>
 */


/**
 * Dependencies
 */
var Checked = require('./checked_types');

/**
 * A list of valid property types
 * @type {Array}
 */
var validPropertyTypes = [ String, Boolean, Number, Object, Array, Date, Checked.String, Checked.Number ];


/**
 * A property gets set in the schema.
 * It gets configured by chained configuration calls.
 * 
 * @param {mixed} type Any of `validPropertyTypes`
 * @param {Object} child
 * @api public
 */
var Property = function(type, child) {
  if (!~validPropertyTypes.indexOf(type)) throw new Error('Invalid type: ' + type);
  if ((type === Array || type === Object) && !child) throw new Error('You have to provide a child when you use the type Array or Object.');

  this.type = type;
  this.child = child;
  this.required = false;
  this.private = false;
};


/**
 * The INVALID property that validate returns.
 * 
 * @return {Object}
 */
Property.INVALID = function() { this.INVALID = true; };


InvalidValueClass = function() { this.INVALID_VALUE = true; };
/**
 * Make it a subclass of Property.INVALID
 */
InvalidValueClass.prototype = new Property.INVALID;
/**
 * The INVALID property that validate returns.
 * 
 * @return {Object}
 */
Property.INVALID_VALUE = new InvalidValueClass;


InvalidRequirementClass = function() { this.INVALID_REQUIREMENT = true; };
/**
 * Make it a subclass of Property.INVALID
 */
InvalidRequirementClass.prototype = new Property.INVALID;
/**
 * The INVALID property that validate returns.
 * 
 * @return {Object}
 */
Property.INVALID_REQUIREMENT = new InvalidRequirementClass;

/**
 * Prototype
 */
Property.prototype = {

  /**
   * Validates the value and returns a sanitized version.
   * Returns Property.INVALID if validation fails.
   * 
   * @param  {mixed} value
   * @return {mixed}  Sanitized value
   */
  validate: function(value) {
    if (value === undefined || value === null) {
      if (this.required) return Property.INVALID_REQUIREMENT;
      else return null;
    }
    switch (this.type) {
      case String:
        if (typeof value === "string" || typeof value === "number") return value.toString();
        else return Property.INVALID_VALUE;
        break;
      case Number:
        if (!isNaN(value = parseFloat(value))) return value;
        else return Property.INVALID_VALUE;
        break;
      case Date:
        var date = new Date(value);
        if (!isNaN(date.getTime())) return date;
        else return Property.INVALID_VALUE;
        break;
      case Boolean:
        return (typeof value === "string" && (value === "0" || value.toLowerCase() === "false")) ? false : !!value;
        break;
      case Array:
        return (value instanceof Array) ? value : Property.INVALID_VALUE;
        break;
      case Object:
        return (value instanceof Object && typeof value === 'object') ? value : Property.INVALID_VALUE;
        break;
      case Checked.String:
        if (value instanceof Checked.String) return value.valueOf();
        else return Property.INVALID_VALUE;
        break;
      case Checked.Number:
        if (value instanceof Checked.Number) return value.valueOf();
        else return Property.INVALID_VALUE;
        break;
      default:
        // Theoretically this case should never happen since the Schema already takes care of the checking.
        throw new Error("The schema is badly described.");
        break;
    }
    return value;
  }

};




/**
 * Array shortcut
 * @param {Object} child
 * @type {Function}
 */
Property.Array = function(child) { return new Property(Array, child); };
/**
 * Object shortcut
 * @param {Object} child
 * @type {Function}
 */
Property.Object = function(child) { return new Property(Object, child); };



/**
 * Exporting the property
 * @type {Property}
 */
module.exports = Property;

