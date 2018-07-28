import { CancelToken } from 'axios';
import { _delete, del, get, post, tryGet } from '../http';
import * as semanticLink from '../http';
import { LinkedRepresentation } from '../interfaces';

const cancelToken: CancelToken = {
  promise: Promise.reject(),
  throwIfRequested: () => {
    return undefined;
  },
};

describe('Get', () => {
  describe('should match on /self/ returning a resolved promise', () => {
    const resource = {
      links: [{ rel: 'self', href: 'https://api.example.com/' }],
    };

    /**
     * Note the mock on axios just returns the response data
     */
    const response = {
      cancelToken: undefined,
      data: {},
      method: 'GET',
      url: 'https://api.example.com/',
    };

    /**
     * We are going to use the inline (resolves) style of testing throughout with expect assertions. The rejects
     * style however doesn't work as expected.
     */

    it('promise syntax with resovles', async () => {
      expect.assertions(1);
      await expect(get(resource, /self/)).resolves.toEqual(response);
    });

    /**
     * Avoid use this style which relies on use of 'return' rather than 'async'
     */
    describe('promise not async', () => {
      it('promise syntax with resovles', () => {
        expect.assertions(1);
        return expect(get(resource, /self/)).resolves.toEqual(response);
      });

      it('promise syntax', () => {
        expect.assertions(1);
        return get(resource, /self/).then(result => {
          expect(result).toEqual(response);
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
        expect(result).toEqual(response);
      });

      it('with resolves', async () => {
        expect.assertions(1);
        await expect(get(resource, /self/)).resolves.toEqual(response);
      });

      it('with promise chain', async () => {
        expect.assertions(1);
        await get(resource, /self/).then(res => {
          expect(res).toEqual(response);
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
        data: {},
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
      const responseWithDefaultValue = {
        data: { links: [] },
        headers: [],
        status: 200,
      };

      it('no cancel token', async () => {
        expect(await tryGet(resource, /self/, 'text/uri-list', { links: [] } as LinkedRepresentation)).toEqual(
          responseWithDefaultValue,
        );
      });

      it('all', async () => {
        expect(
          await tryGet(resource, /self/, 'text/uri-list', cancelToken, { links: [] } as LinkedRepresentation),
        ).toEqual(responseWithDefaultValue);
      });
    });

    describe('match returns with cancel token', () => {
      const responseWithCancel = {
        cancelToken,
        data: {},
        method: 'GET',
        url: 'https://api.example.com/',
      };

      it('no media or default value', async () => {
        expect(await tryGet(resource, /self/, cancelToken)).toEqual(responseWithCancel);
      });

      it('no media with cancel and default', async () => {
        expect(await tryGet(resource, /self/, cancelToken, { links: [] } as LinkedRepresentation)).toEqual(
          responseWithCancel,
        );
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

    test('_delete', () => {
      expect(typeof _delete).toBe(typeof Function);
    });

    test('delete', () => {
      expect(typeof semanticLink.delete).toBe(typeof Function);
    });
  });

  it('should match on /self/ returning a resolved promise', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
    };

    const response = {
      cancelToken: undefined,
      data: undefined,
      method: 'DELETE',
      url: 'https://api.example.com/collection',
    };

    await expect(del(resource, /submit/)).resolves.toEqual(response);
  });

  it('should  match on /submit/ with media type', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection', type: 'text/uri-list' }],
    };

    const response = {
      cancelToken: undefined,
      data: 'http://api.example.com/item/1',
      headers: { 'Content-Type': 'text/uri-list' },
      method: 'DELETE',
      url: 'https://api.example.com/collection',
    };

    await expect(del(resource, /submit/, 'text/uri-list', 'http://api.example.com/item/1')).resolves.toEqual(response);
  });

  it('should not match on /submit/ with media type', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
    };

    await del(resource, /submit/, 'text/uri-list', 'http://api.example.com/item/1').catch(result => {
      expect(result.message).toEqual("The resource doesn't support the required interface");
    });

    await expect(del(resource, /submit/, 'text/uri-list', 'http://api.example.com/item/1')).rejects.toEqual(
      new Error("The resource doesn't support the required interface"),
    );
  });
});

describe('Cancellable', () => {
  test('should be able to move params', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
    };

    const response = {
      cancelToken,
      data: {},
      method: 'GET',
      url: 'https://api.example.com/collection',
    };

    await expect(get(resource, /submit/, cancelToken)).resolves.toEqual(response);
  });
});
