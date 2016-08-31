import test from 'blue-tape';
import fs from 'fs';
import Infer from '../lib';
import _ from 'highland';

test('test infers schema for redshift', async t => {
    const readStream = fs.createReadStream('./test/test-data.json');
    // the stream always throws an unexpected end of input error, just ignore it till we figure out how to fix it
    const highlandStream = _(readStream).split().map(JSON.parse).errors(err => {});
    const infer = new Infer();
    const inferredSchema = await infer.infer(highlandStream);
    const expectedSchema = [ 
        { name: 'my_test_data_id', type: 'integer' }, 
        { name: 'name', type: 'string' }, 
        { name: 'test_int', type: 'integer' } , 
        { name: 'test_date', 'type': 'string' }, 
        { 'name': 'test_float', 'type': 'number'} 
    ];
    t.deepEqual(inferredSchema, expectedSchema);
});

