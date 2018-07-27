import { CancelToken } from 'axios';
import { _delete, del, get, post, tryGet } from '../http';
import * as semanticLink  from '../http';
import { LinkedRepresentation } from '../interfaces';

const cancelToken: CancelToken = {
  promise: Promise.reject(),
  throwIfRequested: () => {
    return undefined;
  },
};

describe('Get', () => {
  it('should match on /self/ returning a resolved promise', async () => {
    const resource = {
      links: [{ rel: 'self', href: 'https://api.example.com/' }],
    };

    const response = {
      cancelToken: undefined,
      data: {},
      method: 'GET',
      url: 'https://api.example.com/',
    };

    const result = await get(resource, /self/);

    expect(result).toEqual(response);
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

    const result = await post(resource, /submit/, { a: 'b' });

    expect(result).toEqual(response);
  });
});

describe('Delete', () => {

  describe('alias', () => {

    test('del', () => {
      expect(typeof del).toBe(typeof Function)
    });

    test('_delete', () => {
      expect(typeof _delete).toBe(typeof Function)
    });

    test('delete', () => {
      expect(typeof semanticLink.delete).toBe(typeof Function)
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

    const result = await del(resource, /submit/);

    expect(result).toEqual(response);
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

    const result = await del(resource, /submit/, 'text/uri-list', 'http://api.example.com/item/1');

    expect(result).toEqual(response);
  });

  it('should not match on /submit/ with media type', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
    };

    await del(resource, /submit/, 'text/uri-list', 'http://api.example.com/item/1')
      .catch(result => {
        expect(result).toEqual('The resource doesn\'t support the required interface');
      });
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

    const result = await get(resource, /submit/, cancelToken);

    expect(result).toEqual(response);
  });
});
