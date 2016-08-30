export default {
    'string': {
        fn: 'string',
        args: [],
        dt: 'character varying',
        priority: 0,
    },
    'number': {
        fn: 'decimal',
        args: [20, 5],
        dt: 'numeric',
        priority: 1,
    },
    'integer': {
        fn: 'integer',
        args: [],
        dt: 'integer',
        priority: 2,
    },
    'boolean': {
        fn: 'boolean',
        args: [],
        dt: 'boolean',
        priority: 3,
    },
    'datetime': {
        fn: 'timestamp',
        args: [true],
        dt: 'timestamp without time zone',
        priority: 4,
    },
}
