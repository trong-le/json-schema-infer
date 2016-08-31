'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _highland = require('highland');

var _highland2 = _interopRequireDefault(_highland);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONSchemaInfer = function () {
    function JSONSchemaInfer() {
        _classCallCheck(this, JSONSchemaInfer);
    }

    _createClass(JSONSchemaInfer, [{
        key: 'infer',


        /*
         * infer will output an array containing the columns of the inferred schema from the stream. it should look like this.
         *
         * const incomingSchema = [
         * { name: 'foo', type: 'integer' },
         * { name: 'bar', type: 'string' } ];
         *
         * the 'type' fields will be different depending on the 'client' value supplied at the constructor
         */
        value: function infer(stream) {
            var _this = this;

            var schemaHint = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            return new Promise(function (resolve, reject) {
                var schema = [];
                stream.on('data', function (obj) {
                    var newFields = Object.keys(obj).map(function (key) {
                        // check to see if we already have the field
                        var existingField = schema.find(function (field) {
                            return field.name === key;
                        });
                        // check to see if there's a hinted field
                        var hintedField = schemaHint.find(function (col) {
                            return col.name === key;
                        });
                        // Infer type of this field.
                        var value = obj[key];

                        var type = null;
                        if (value === 'true' || value == '1' || value == 'false' || value == '0') {
                            type = 'boolean';
                        }

                        if (/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/.test(value)) {
                            var tmpFloat = parseFloat(value, 10);
                            if (tmpFloat % 1 === 0) {
                                type = 'integer';
                            } else {
                                type = 'number';
                            }
                        } else if (/^\d{4}-[01]\d-[0-3]\d$/.test(value)) {
                            type = 'date';
                        } else if (/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/.test(value)) {
                            //from http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
                            type = 'datetime';
                        } else {
                            type = 'string';
                        }

                        // if we don't already have it, and there is a hint, return the hint
                        if (!existingField && hintedField) {
                            return hintedField;
                        }

                        // if we have already have it, and there is an type, check if we should change the the value
                        // this is useful if the initial inference was an integer, but the column contains floats so we need
                        // to change the column type to a decimal representation
                        if (existingField && type) {
                            if (_this.shouldChangeType(existingField.type, type)) {
                                existingField.type = type;
                                return;
                            }
                        }

                        if (existingField) {
                            return;
                        }

                        // Return name, type object.
                        return { name: key, type: type };
                    });

                    // Push new fields,
                    // remove any undefined (already exists).
                    schema.push.apply(schema, _toConsumableArray(newFields.filter(Boolean)));
                });

                stream.on('end', function () {
                    resolve(schema);
                });

                stream.on('error', function (err) {
                    return reject(err);
                });
            });
        }
    }, {
        key: 'shouldChangeType',
        value: function shouldChangeType(originalType, newType) {
            if (newType === 'string' && originalType !== 'string') {
                return true;
            }

            if (originalType === 'integer' && newType === 'number') {
                return true;
            }

            return false;
        }
    }]);

    return JSONSchemaInfer;
}();

exports.default = JSONSchemaInfer;