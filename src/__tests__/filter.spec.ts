import each from 'jest-each';
import ulog from 'ulog';
import {
    filter,
    getTitle,
    getUri,
    instanceOfLinkedRepresentation,
    matches,
    RelationshipType,
} from '../filter';
import { Link, LinkedRepresentation } from '../interfaces';

ulog.level = ulog.DEBUG;

describe('Link Representation ', () => {
    const testRelsOnly = [
        ['single string', 'self', true],
        ['single regex', /self/, true],
        ['regex begin/end', /^self$/, true],
        ['regex global', /^self$/g, true],
        ['regex case insensitive', /^Self$/i, true],
        ['array string first', ['self', 'first'], true],
        ['array string double', ['self', 'self'], true],
        ['array string last', ['first', 'self'], true],
        ['array string set middle', ['first', 'self', 'last'], true],
        ['array string set last', ['first', 'last', 'self'], true],
        ['array string/regex', ['first', 'last', /self/], true],
        ['array string/regex', ['/last/', 'last', /self/], true],
        ['not found single string', 'canonical', false],
        ['not found single regex', /canonical/, false],
        ['not found regex specific', /^canonical/, false],
        ['not found array string', ['canonical', 'last'], false],
    ];

    describe('matches rels only', () => {
        /**
         * Single data point of only one link. It should be able to match
         *  on 'self' throughout the tests of
         */
        const singleLink: LinkedRepresentation = {
            links: [{ rel: 'self', href: 'http://example.com/1' }],
        };

        /**
         * Mulitple links to search through where the 'self' link is last
         */
        const multipleLinks: LinkedRepresentation = {
            links: [{ rel: 'tags', href: 'http://example.com/tag/1' }, { rel: 'self', href: 'http://example.com/1' }],
        };

        [singleLink, multipleLinks].forEach(links => {
            each(testRelsOnly).test('%s: (%s, %s)', (desc: any, rel: any, expected: any) => {
                        expect(matches(links, rel)).toBe(expected);
                    },
            );
        });
    });

    describe('filter rels and media type', () => {
        /**
         * Mulitple links to search through where the 'tags' returns multiple links
         */
        const links: LinkedRepresentation = {
            links: [
                { rel: 'tags', href: 'http://example.com/tag/1', type: 'application/json' },
                { rel: 'tags', href: 'http://example.com/tag/2', type: 'text/uri-list' },
                { rel: 'tags', href: 'http://example.com/tag/3', type: 'application/json' },
                { rel: 'tags', href: 'http://example.com/tag/4' },
                { rel: 'edit-form', href: 'http://example.com/tag/edit/form', type: 'text/uri-list' },
                { rel: 'edit-form', href: 'http://example.com/tag/edit/form', type: 'application/json-path+json' },
                { rel: 'self', href: 'http://example.com/1', type: 'application/json' },
            ],
        };

        const rels = [
            ['null is wilcard', 'tags', null, 4],
            ['empty is empty', 'tags', '', 1],
            ['wildcard', 'tags', '*', 4],
            ['wildcard', 'tags', '*/*', 4],
            ['specific mediaType does not include non-specified', 'tags', 'application/json', 2],
            ['specific mediaType does not include non-specified', 'tags', 'text/uri-list', 1],
            ['specific mediaType does not include non-specified', 'edit-form', 'text/uri-list', 1],
        ];

        each(rels).test('filter - %s: (%s, %s)', (desc: any, rel: any, mediaType: any, expected: any) => {
                    expect(filter(links, rel, mediaType).length).toBe(expected);
                },
        );

        each(rels).test('matches %s: (%s, %s)', (desc: any, rel: any, mediaType: any, expected: any) => {
                    expect(matches(links, rel, mediaType)).toBe(expected > 0);
                },
        );
    });

    describe('get uri and title', () => {
        const representation: LinkedRepresentation = {
            links: [
                { rel: 'self', href: 'http://example.com/1', title: 'One' },
                { rel: 'self', href: 'http://example.com/2', title: 'Two' },
                { rel: 'first', href: 'http://example.com/2' },
                { rel: 'empty', href: '' },
            ],
        };

        test('uri', () => {
            expect(getUri(representation, 'self')).toBe('http://example.com/1');
        });

        test('title', () => {
            expect(getTitle(representation, 'self')).toBe('One');
        });

        test('empty title return empty string', () => {
            expect(getTitle(representation, 'first')).toBe('');
        });

        test('empty href does not throw Error', () => {
            expect(getUri(representation, 'empty')).toBe(undefined);
        });
        test('empty href returns default', () => {
            expect(getUri(representation, 'empty', undefined, 'a')).toBe('a');
        });
    });
});

describe('getUri', () => {
    /**
     * Multiple links to search through where the 'tags' returns multiple links
     */
    const links: LinkedRepresentation = {
        links: [
            { rel: 'tags', href: 'http://example.com/tag/1', title: 'aaa', type: 'application/json' },
            { rel: 'tags', href: 'http://example.com/tag/2', title: 'bob', type: 'text/uri-list' },
            { rel: 'tags', href: 'http://example.com/tag/3', type: 'application/json' },
            { rel: 'tags', href: 'http://example.com/tag/4' },
            { rel: 'tags', href: 'http://example.com/tag/5', title: 't1' },
            { rel: 'tags', href: 'http://example.com/tag/6', title: 't2' },
            { rel: 'tags', href: 'http://example.com/tag/7', title: 't2' },
            { rel: 'edit-form', href: 'http://example.com/tag/edit/form', type: 'text/uri-list' },
            { rel: 'edit-form', href: 'http://example.com/tag/edit/form', type: 'application/json-path+json' },
            { rel: 'self', href: 'http://example.com/1', type: 'application/json' },
        ],
    };

    const rels = [
        ['empty link relation', '', undefined],
        ['by title', { rel: 'tags', title: 't1' }, 'http://example.com/tag/5'],
        ['second selector', ['invalid', { rel: 'tags', title: 't2' }], 'http://example.com/tag/6'],
        ['second selector', ['invalid', { rel: 'tags', title: 't1' }], 'http://example.com/tag/5'],
        ['no title', ['invalid', { rel: 'tags' }], 'http://example.com/tag/1'],
        ['empty title', ['invalid', { rel: 'tags', title: '' }], 'http://example.com/tag/3'],
    ];

    each(rels).test('filter - %s: (%s, %s)', (desc: any, rel: RelationshipType, expected: string) => {
                expect(getUri(links, rel)).toBe(expected);
            },
    );
});

describe('Errors and logging', () => {
    test('empty linked representation', () => {
        expect(matches({} as LinkedRepresentation, '')).toBeFalsy();
    });
    test('empty array links', () => {
        expect(matches([] as Link[], '')).toBeFalsy();
    });
    test('empty Element', () => {
        expect(matches({} as Element, '')).toBeFalsy();
    });
});

describe('type guard - instanceOfLinkedRepresentation ', () => {
    const rels = [
        ['empty', '', false],
        ['null', null, false],
        ['undefined', undefined, false],
        ['string', 'hello', false],
        ['number', 5, false],
        ['regex', /aa/, false],
        ['empty', {}, false],
        ['other structure', {bob: ''}, false],
        ['invalid links - number', { links: 5 }, false],
        ['invalid links - string', { links: '' }, false],
        ['invalid links - object', { links: {} }, false],
        ['valid', { links: [] }, true],
    ];

    each(rels).test('instanceOf - %s: (%s, %s)', (desc: any, anObject: any, expected: boolean) => {
                expect(instanceOfLinkedRepresentation(anObject)).toBe(expected);
            },
    );
});
