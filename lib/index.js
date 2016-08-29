import _ from 'highland';
import logger from './util/logger';
import { redshiftDataTypes } from './data-types';

export default class JSONSchemaInfer {

    constructor(options) {
        this.client = options.client || 'redshift';
        this.dataTypes = this.getDataTypesForClient(this.client);
    }

    getDataTypesForClient(client) {
        switch (client) {
            case 'redshift':
                return redshiftDataTypes;
                break;
            default:
                return null;
                break;
        }
    }

    /*
     * infer will output an array containing the columns of the inferred schema from the stream. it should look like this.
     *
     * const incomingSchema = [
     * { name: 'foo', type: 'integer' },
     * { name: 'bar', type: 'string' } ];
     *
     * the 'type' fields will be different depending on the 'client' value supplied at the constructor
     */
    infer(stream, schemaHint = []) {
        return new Promise((resolve, reject) => {
            const schema = [];
            stream.on('data', obj => {
                const newFields = Object.keys(obj).map(key => {
                    // check to see if we already have the field
                    const existingField = schema.find(field => field.name === key);
                    // check to see if there's a hinted field
                    const hintedField = schemaHint.find(col => col.name === key);
                    // Infer type of this field.
                    // Could be 'number', 'string', etc. These are javascript types
                    const javascriptType = typeof obj[key];
                    // javascript only has a 'number' type, therefore
                    // if it's a number, check to see if it is an integer or decimal type
                    // if it is a number and it has a '.' we assume it to be a decimal,
                    // if there is no '.' then we assume integer. otherwise use whatever the inferred type was
                    const type = javascriptType === 'number'
                        ? ((obj[key].toString().indexOf('.') === -1) ? 'integer' : 'decimal')
                        : javascriptType;
                    // map the generic type to a specifc type for the destination
                    const inferredType = this.dataTypes[type].fn;

                    // if we don't already have it, and there is a hint, return the hint
                    if (!existingField && hintedField) {
                        return hintedField;
                    }

                    // if we have already have it, and there is an inferredType, check if we should change the the value
                    // this is useful if the initial inference was an integer, but the column contains floats so we need
                    // to change the column type to a decimal representation
                    if (existingField && type) {
                        if (this.shouldChangeType(existingField.type, inferredType)) {
                            existingField.type = inferredType;
                            return;
                        }
                    }

                    if (existingField) {
                        return;
                    }

                    // Regex support for schemaHint
                    // const regexHint = schemaHint.find(current => current.regex && key.match(new RegExp(current.name)));
                    // if (regexHint) return { name: key, type: regexHint.type };

                    // Return name, type object.
                    return { name: key, type };
                });

                // Push new fields,
                // remove any undefined (already exists).
                schema.push( ...newFields.filter(Boolean) );
            });

            stream.on('end', () => {
                logger.info(schema);
                resolve(schema);
            });

            stream.on('error', err => reject(err));
        });
    }

    shouldChangeType(originalType, newType) {
        if (originalType === 'integer' && newType === 'decimal') {
            return true;
        }

        return false;
    }
}

