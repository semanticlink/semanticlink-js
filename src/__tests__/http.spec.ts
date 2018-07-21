import { CancelToken } from 'axios';
import { _delete, get, post, tryGet } from '../http';
import { LinkedRepresentation } from '../interfaces';

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

    const response = {
      cancelToken: undefined,
      data: {},
      method: 'GET',
      url: 'https://api.example.com/',
    };

    it('no optional', async () => {
      expect(await tryGet(resource, /self/)).toEqual(response);
    });

    it('no media type or cancel token', async () => {
      expect(await tryGet(resource, /self/, { links: [] } as LinkedRepresentation)).toEqual(response);
    });

    it('no cancel token', async () => {
      expect(await tryGet(resource, /self/, 'text/uri-list', { links: [] } as LinkedRepresentation)).toEqual(response);
    });

    it('all', async () => {
      expect(
        await tryGet(resource, /self/, 'text/uri-list', {} as CancelToken, { links: [] } as LinkedRepresentation),
      ).toEqual(response);
    });

    it('no media or default value', async () => {
      expect(await tryGet(resource, /self/, {} as CancelToken)).toEqual(response);
    });

    it('no media with cancel and default', async () => {
      expect(await tryGet(resource, /self/, {} as CancelToken, { links: [] } as LinkedRepresentation)).toEqual(
        response,
      );
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

    const result = await _delete(resource, /submit/);

    expect(result).toEqual(response);
  });

  it('should  match on /submit/ with media type', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection', type: 'text/uri-list' }],
    };

    const response = {
      cancelToken: undefined,
      data: 'text/uri-list',
      method: 'DELETE',
      url: 'https://api.example.com/collection',
    };

    const result = await _delete(resource, /submit/, 'text/uri-list', 'http://api.example.com/item/1');

    expect(result).toEqual(response);
  });

  it('should not match on /submit/ with media type', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
    };

    await _delete(resource, /submit/, 'text/uri-list', 'http://api.example.com/item/1').catch(result => {
      expect(result).toEqual("The resource doesn't support the required interface");
    });
  });
});

describe('Cancellable', () => {
  test('should be able to move params', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
    };

    const response = {
      cancelToken: {},
      data: {},
      method: 'GET',
      url: 'https://api.example.com/collection',
    };

    const result = await get(resource, /submit/, {} as CancelToken);

    expect(result).toEqual(response);
  });
});
