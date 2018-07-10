import { CancelToken } from 'axios';
import { _delete, get, post } from '../index';

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

    const result = await get(resource, /self/, undefined);

    expect(result).toEqual(response);
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

    const result = await post(resource, /submit/, undefined, { a: 'b' });

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

    const result = await _delete(resource, /submit/, undefined);

    expect(result).toEqual(response);
  });
  it('should match on /submit/ with media type', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
    };

    const response = {
      cancelToken: undefined,
      data: 'http://api.example.com/item/1',
      headers: { 'Content-Type': 'text/uri-list' },
      method: 'DELETE',
      url: 'https://api.example.com/collection',
    };
    const result = await _delete(resource, /submit/, 'text/uri-list', 'http://api.example.com/item/1');

    expect(result).toEqual(response);
  });
});

describe('Cancellable', () => {
  test('d', async () => {
    const resource = {
      links: [{ rel: 'submit', href: 'https://api.example.com/collection' }],
    };

    const response = {
      cancelToken: {},
      data: {},
      method: 'GET',
      url: 'https://api.example.com/collection',
    };

    const result = await get(resource, /submit/, 'text/uri-list', {} as CancelToken);

    expect(result).toEqual(response);
  });
});
