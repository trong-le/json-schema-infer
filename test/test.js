import fs from 'fs';
import Infer from '../lib';
import _ from 'highland';
import chai from 'chai';
import isEqual from 'lodash.isequal';
const assert = chai.assert;

describe('Infer', () => {
    describe('#infer()', () => {
        it('test infers schema for redshift', async () => {
            const rs = fs.createReadStream('./test/fixtures/testData.json');
            // stream always throws an unexpected end of input error, just ignore it till we figure out how to fix it
            const highlandStream = _(rs).split().map(JSON.parse).errors(err => {});
            const infer = new Infer();
            const inferredSchema = await infer.infer(highlandStream);
            const expectedSchema = [
                { name: 'my_test_data_id', type: 'integer' },
                { name: 'name', type: 'string' },
                { name: 'test_int', type: 'integer' } ,
                { name: 'test_date', 'type': 'string' },
                { name: 'test_float', type: 'number'},
                { name: 'time', type: 'time'},
                { name: 'date', type: 'date'}
            ];
            assert(isEqual(inferredSchema, expectedSchema), 'Schemas are not equal');
        });
    });

    describe('#infer()', () => {
        it('infer speedscore schema', async () => {
            const rs = fs.createReadStream('./test/fixtures/speedscoreExpected.json');
            // stream always throws an unexpected end of input error, just ignore it till we figure out how to fix it
            const highlandStream = _(rs).split().map(JSON.parse).errors(err => {});
            const infer = new Infer();
            const inferredSchema = await infer.infer(highlandStream);
            const expectedSchema = [
                { name: 'SpeedScore', type: 'string' },
                { name: 'Duration', type: 'time' },
                { name: 'DID', type: 'biginteger' },
                { name: 'ANI', type: 'biginteger' },
                { name: 'Target', type: 'biginteger' },
                { name: 'AdSource', type: 'string' },
                { name: 'Channel', type: 'string' },
                { name: 'Offer', type: 'string' },
                { name: 'Product', type: 'string' },
                { name: 'TID', type: 'string' },
                { name: 'Employee Name', type: 'string' },
                { name: 'City', type: 'string' },
                { name: 'State', type: 'string' },
                { name: 'CallRecording', type: 'string' },
                { name: 'CallID', type: 'integer' },
                { name: 'LeadDate', type: 'date' },
                { name: 'LeadDay', type: 'string' },
                { name: 'LeadTime', type: 'time' },
                { name: 'CustomerID', type: 'integer' },
                { name: 'CustomerName', type: 'string' },
                { name: 'CallerFirstName', type: 'string' },
                { name: 'CallerMiddleInitial', type: 'string' },
                { name: 'CallerLastName', type: 'string' },
                { name: 'CallerAddress', type: 'string' },
                { name: 'CallerZip', type: 'string' }
            ];
            assert(isEqual(inferredSchema, expectedSchema), 'Schemas are not equal');
        });
    });
});

