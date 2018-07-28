# Semantic Link library

A utility library for manipulating a list of links that form a semantic interface to a resource.

This library is able to work with atom-like representations (ATOM is an XML-based document format). We use this
to describe collections which describes lists of related information collections (in atom known as "feeds").
Collections (feeds in atom) are composed of a number of items (in atom known as "entries") each with an extensible set
of attached metadata or attributes.

The library has two aspects:

1. Matching and filtering of link relations on a representation [`filter`,`matches`,`getUri`,`getTitle`]
2. Sending and receiving across the wire via http (axios) based on above [`get`,`put`,`post`,`delete`, `patch`, `tryGet`]

## Representation

Very simple examples

```js
import { getUri, matches, filter } from 'semantic-link';
import * as semanticLink from 'semantic-link';

const order = {
  links: [
    { rel: "self", href: "http://example.com/order/1" }
   ]
   title: "A first order"
 }

getUri(order, /self/);                                // returns 'http://example.com/order/1'
matches(order, /self/);                               // returns true
filter(order, /self/);                                // returns order object

semanticLink.get(order, /self/);                      // HTTP GET on self link to return representation (via axios)
semanticLink.put(order, /self/, {title: 'Updated'});  // HTTP PUT on self link to send back data

```

# Installation

Using yarn:

```bash
$ yarn add semantic-link
```

Note: this has a dependency on `axios`

# Usage

```js
//individually
import { getUri, getTitle, matches, filter, get, put, post, del, patch, tryGet } from 'semantic-link';

// as wildcard
import * as semanticLink from 'semantic-link';
```

## Matching on link relations

The basic interface for matching is to look for link rels on the representation.

```
get(resource, 'self')
get(resource, /self/)
get(resource, /self|canonical/)
post(resource, ['submit', 'self'])
```

There are lots of ways to do this:

* string: exact match on only that value
  * `'self'`
* regex: result of the regular expression
  * `/self/`  (anywhere)
  * `/^self$/`  (must match-same as string match)
  * `/self|canonical/` (either)
  * `/edit-form/`
* list of strings: exact match in order
  * `['self', 'submit']`

Note: you can have a list of regex too.


## Matching on media type (optional)

The basic interface for matching can also be *specific* to media type.

```
filter(resource, 'self')
matches(resource, 'edit-form', 'text/uri-list')
get(resource, 'self', 'application/json')
post(resource, 'submit', 'application/json-patch+json', data)
```

Note: When the media type is specified it *must* be found there is no fallback other types.

## Http (`get`,`put`,`post`,`delete`, `patch`, `tryGet`, `link`)

This is just a light wrapper around `axios` and can have all the options of axios handed in.

```

// Promise based

get(resource, 'self')
    .then(response => {
        // type: AxiosResponse<LinkedRepresentation|CollectionRepresentation>
    })
    .then(err => {
        // type: AxiosError
    });

// or async/await (or with error handling try/catch)

const response = await get(resource, 'self');



```


There is also a specific param for a `Cancellable`.

```
import { CancelToken } from 'axios';

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

get(resource, 'self', 'application/json', source.token)

source.cancel('Operation canceled by the user.');
```

Note: access to axios is through the `link` interface (all the other methods call this).


## License

[MIT](http://opensource.org/licenses/MIT)

