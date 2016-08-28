import test from 'blue-tape';
import fs from 'fs';
import Infer from '../lib';

test('test infers schema for redshift', t => {
    const readStream = fs.createReadStream('./test-data.json');
    const options = { client: 'redshift' };
    const infer = new Infer(options);
    const inferredSchema = infer(readStream);
});

