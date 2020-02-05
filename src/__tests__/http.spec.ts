import * as semanticLink from '../http';
import { del, get, post, tryGet } from '../http';
import { LinkedRepresentation } from '../interfaces';

describe('Get', () => {
    describe('should match on /self/ returning a resolved promise', () => {
        const resource: LinkedRepresentation = {
            links: [{ rel: 'self', href: 'https://api.example.com/' }],
        };

        /**
         * Note the mock on axios just returns the response data
         */
        const calledWith = {
            cancelToken: undefined,
            data: undefined,
            method: 'GET',
            url: 'https://api.example.com/',
        };

        /**
         * We are going to use the inline (resolves) style of testing throughout with expect assertions. The rejects
         * style however doesn't work as expected.
         */

        it('promise syntax with resovles', async () => {
            expect.assertions(1);
            await expect(get(resource, /self/)).resolves.toEqual(calledWith);
        });

        /**
         * Avoid use this style which relies on use of 'return' rather than 'async'
         */
        describe('promise not async', () => {
            it('promise syntax with resolves', () => {
                expect.assertions(1);
                return expect(get(resource, /self/)).resolves.toEqual(calledWith);
            });

            it('promise syntax', () => {
                expect.assertions(1);
                return get(resource, /self/).then(result => {
                    expect(result).toEqual(calledWith);
                });
            });
        });

        describe('await syntax', () => {
            /**
             * These all do the same but ensure that the syntax is working
             */

            it('inline', async () => {
                expect.assertions(1);
                const result = await get(resource, /self/);
                expect(result).toEqual(calledWith);
            });

            it('with resolves', async () => {
                expect.assertions(1);
                await expect(get(resource, /self/)).resolves.toEqual(calledWith);
            });

            it('with promise chain', async () => {
                expect.assertions(1);
                await get(resource, /self/).then(res => {
                    expect(res).toEqual(calledWith);
                });
            });

            it('with promise chain catch', async () => {
                expect.assertions(1);
                await get(resource, /self/)
                        .then(() => {
                            throw new Error('dead');
                        })
                        .catch(err => {
                            expect(err.message).toEqual('dead');
                        });
            });

            it('with promise chain catch resolves to Error (do not use this style)', async () => {
                expect.assertions(1);
                await expect(get(resource, /self/).then(() => Promise.reject(new Error('dead')))).rejects.toEqual(
                        new Error('dead'),
                );
            });

            it('with promise chain catch correctly has an Error returned on catch to read message', async () => {
                expect.assertions(1);
                await get(resource, /self/)
                        .then(() => Promise.reject(new Error('dead')))
                        .catch(err => {
                            expect(err.message).toEqual('dead');
                        });
            });
        });
    });

    describe('tryGet - param shifting', () => {
        const resource = {
            links: [{ rel: 'self', href: 'https://api.example.com/' }],
        };

        describe('does request', () => {
            const response = {
                cancelToken: undefined,
                data: undefined,
                method: 'GET',
                url: 'https://api.example.com/',
            };

            it('match no optional', async () => {
                expect(await tryGet(resource, /self/)).toEqual(response);
            });

            it('match with no media type or cancel token', async () => {
                expect(await tryGet(resource, /self/, { links: [] } as LinkedRepresentation)).toEqual(response);
            });
        });

        describe('specific media type returns default value', () => {
            const calledWith = {
                data: undefined,
                method: 'GET',
                url: 'https://api.example.com/',
            };

            it('no cancel token', async () => {
                const actual = await tryGet(resource, /self/, { links: [] } as LinkedRepresentation);
                expect(actual).toEqual(calledWith);
            });

            it('all', async () => {
                expect(
                        await tryGet(resource, /self/, { links: [] } as LinkedRepresentation),
                ).toEqual(calledWith);
            });
        });

        describe('match returns with cancel token', () => {
            const calledWith = {
                data: undefined,
                method: 'GET',
                url: 'https://api.example.com/',
            };

            it('no media or default value', async () => {
                expect(await tryGet(resource, /self/)).toEqual(calledWith);
            });

            it('no media with cancel and default', async () => {
                expect(await tryGet(resource, /self/, { links: [] } as LinkedRepresentation))
                        .toEqual(calledWith);
            });
        });
    });
});

describe('Post', () => {
    it('should match on /self/ returning a resolved promise', async () => {
        const resource = {
            links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
        };

        const response = {
            cancelToken: undefined,
            data: { a: 'b' },
            method: 'POST',
            url: 'https://api.example.com/collection',
        };

        await expect(post(resource, /submit/, { a: 'b' })).resolves.toEqual(response);
    });
});

describe('Delete', () => {
    describe('alias', () => {
        test('del', () => {
            expect(typeof del).toBe(typeof Function);
        });
    });

    const calledWith = {
        cancelToken: undefined,
        data: undefined,
        method: 'DELETE',
        url: 'https://api.example.com/collection',
    };

    it('should match on /self/ returning a resolved promise', async () => {
        const resource = {
            links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
        };

        await expect(del(resource, /submit/)).resolves.toEqual(calledWith);
    });
});

