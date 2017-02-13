import _ from 'highland';
import { createLogger } from 'aries-data';
const log = createLogger(__filename);

export default class JSONSchemaInfer {

    /**
     * Infer will output an array containing the columns of the inferred schema from the stream. it should look like this.
     *
     * const incomingSchema = [
     * { name: 'foo', type: 'integer' },
     * { name: 'bar', type: 'string' } ];
     *
     * the 'type' fields will be different depending on the 'client' value supplied at the constructor.
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

                    if (!existingField && hintedField) {
                      return hintedField;
                    }
                    // Infer type of this field.
                    const value = obj[key];

                    let type = null;
                    if ((value === 'true') || (value == '1') || (value == 'false') || (value == '0')) {
                        type = 'boolean';
                    }

                    if (/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/.test(value)) {
                        const tmpFloat = parseFloat(value, 10);
                        log.debug(tmpFloat);
                        if (tmpFloat % 1 === 0) {
                            if (tmpFloat > Math.pow(2, 31)-1 || tmpFloat < Math.pow(-2,31)) {
                                log.debug('is biginteger')
                              type = 'biginteger';
                            } else {
                                log.debug('is integer');
                              type = 'integer';
                            }
                        } else {
                            type = 'number';
                        }
                    } else if (/^\d{4}-[01]\d-[0-3]\d$/.test(value)) {
                        type = 'date';
                    } else if (/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/.test(value)){       //from http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
                        type = 'datetime';
                    } else if (/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/.test(value)) {
                        type = 'time'
                    } else {
                        type = 'string';
                    }

                    // if we have already have it, and there is an type, check if we should change the the value
                    // this is useful if the initial inference was an integer, but the column contains floats so we need
                    // to change the column type to a decimal representation
                    if (existingField && type) {
                        if (this.shouldChangeType(existingField.type, type)) {
                            existingField.type = type;
                            return;
                        }
                    }

                    if (existingField) {
                        return;
                    }

                    // Return name, type object.
                    return { name: key, type };
                });

                // Push new fields,
                // remove any undefined (already exists).
                schema.push( ...newFields.filter(Boolean) );
            });

            stream.on('end', () => {
                resolve(schema);
            });

            stream.on('error', err => reject(err));
        });
    }

    shouldChangeType(originalType, newType) {
        if (newType === 'string' && originalType !== 'string') {
            return true;
        }

        if (originalType === 'integer' && (newType === 'number' || newType === 'biginteger')) {
            return true;
        }

        return false;
    }
}
