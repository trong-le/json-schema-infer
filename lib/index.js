import _ from 'highland';

export default class JSONSchemaInfer {

    constructor(options) {
        this.client = options.client || 'redshift';

    }

    infer(stream, schemaHint = []) {

    }
}

