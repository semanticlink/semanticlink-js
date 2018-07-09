# Semantic Link library

A utility library for manipulating a list of links that form a semantic interface to a resource.

This library is able to work with atom-like representations (ATOM is an XML-based document format). We use this
to describe collections which describes lists of related information collections (in atom known as "feeds").
Collections (feeds in atom) are composed of a number of items (in atom known as "entries") each with an extensible set
of attached metadata or attributes.

Example data of a collection Resource object with a array called links:

 ```json
 {
  links: [
    { rel: "collection", href: "http://example.com/orders/" },
    { rel: "self", href: "http://example.com/orders/" },
    { rel: "item", href: "http://example.com/orders/1"},
    { rel: "first", href: "http://example.com/orders/1"},
    { rel: "item", href: "http://example.com/orders/2"},
    { rel: "item", href: "http://example.com/orders/3"},
    { rel: "last", href: "http://example.com/orders/3"}
   ]
   ...
 }
```
Example calls:

```js
filter(representation, 'self')            // return single based on string match
filter(representation, /self/)            // return single based on regex (contains)
filter(representation, /^self$/)          // return single based on regex (only)
filter(representation, /self|canonical/)  // return single based on regex (only)
filter(representation, /item/)            // return multiple based on regex
```

# Installation

Using yarn:

```bash
$ yarn add semantic-link
```

# Example

```js
import { getUrl } from 'semantic-link';

/**
* @type {LinkedRepresentation}
*/
const representation = {
     links: [
       { rel: 'self', href: 'https://api.example.com/tag/1' }
     ],
     name: 'work'
   };

console.log(getUrl(representation, 'self'));  // https://api.example.com/tag/1
```

## License

[MIT](http://opensource.org/licenses/MIT)

