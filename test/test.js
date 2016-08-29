import test from 'blue-tape';
import fs from 'fs';
import Infer from '../lib';
import _ from 'highland';
import dataTypes from './test-data-types';

test('test infers schema for redshift', async t => {
    const readStream = fs.createReadStream('./test/test-data.json');
    // the stream always throws an unexpected end of input error, just ignore it till we figure out how to fix it
    const highlandStream = _(readStream).split().map(JSON.parse).errors(err => {});
    const options = { dataTypes: dataTypes };
    const infer = new Infer(options);
    const inferredSchema = await infer.infer(highlandStream);
    const expectedSchema = [ { name: 'foo', type: 'string' }, { name: 'testFloat', type: 'decimal' }, { name: 'testInt', type: 'integer' }];
    t.deepEqual(inferredSchema, expectedSchema);
});

