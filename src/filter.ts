import { Link, LinkedRepresentation } from './interfaces';
import { log } from './logger';

/**
 * A media type is a well known type/string (formerly known as mime type).
 *
 *  This parameter is a well known mime type. e.g. `application/json`, `text/html`, `text/uri-list` etc.
 *
 * @example
 *
 *  Specific
 *
 *  - `application/json`
 *  - `application/x-www-form-urlencoded`
 *  - `application/xml`
 *  - `text/html`
 *  - `text/uri-list`
 *
 *  Wildcard
 *
 *  - `*`
 *  - `* /*` [no spaces]
 *
 *  Note: no support for multi type or parameters (eg q values)
 *
 *  @see https://en.wikipedia.org/wiki/Media_type
 */
export type MediaType = string;

/**
 * A link relation is the descriptive attribute attached to define the type of link/relationships. There are known
 * link relations (IANA) and custom specific to the domain of the api.
 *
 *  The relation type can be:
 *
 *   - an exact matching string
 *   - a magic wildcard string `*`
 *   - a regular expression
 *
 * @example
 *
 *  - string: 'self'
 *  - regexp: /self/, /^self$/, /self|canonical/
 *  - string[]: ['self', 'first']
 *  - regexp[]: [/self/, /canonical/]
 *
 * @see https://www.iana.org/assignments/link-relations/link-relations.xhtml
 * @see https://en.wikipedia.org/wiki/Link_relation
 */
export type RelationshipType = string | RegExp | string[] | RegExp[];

/**
 * The are various ways we want to find links within objects.
 *
 *  This is the first parameter to most methods on this object. It
 *  is an object with some form of semantic interface, that contains
 *  links. The supported forms of this parameter are:
 *
 *  - the `<head>` element of a html DOM
 *  - the magic identifier `HEAD` (as a synonym for the `<head>` {@link Element)
 *  - an array of {@link Link} objects with `rel`, `type` and `href` values
 *  - an {@link LinkedRepresentation} object with a `links` object which an array of link objects
 *
 *
 *  - {@link LinkedRepresentation} - just about always used
 *  - {@link LinkedRepresentation.links}
 *  - string
 *  - DOM {@link Element} - usually when locating the root of the api on the HTML page.
 */
export type LinkType = LinkedRepresentation | Link[] | string | Element;

/**
 * A uri formatted string
 *
 * In practice, we just about never look inside a uri. We treat them as absolute references and just follow them.
 *
 * @example
 *
 *  - https://api.example.com/resource/1
 *
 * @see https://en.wikipedia.org/wiki/Uniform_Resource_Identifier
 */
export type Uri = string;

/**
 * Map the list of child <link> elements from the given DOM element into simple link objects.
 *
 * @example
 *
 * <!doctype html >
 * <html lang="en">
 * <head>
 *   <link rel="api" href="https://api.example.com/"/>
 * </head>
 *  ...
 * </html>
 *
 * @return an array of links that match
 * @private
 */
function filterDom(element: Document | Element, relationshipType: RelationshipType, mediaType: MediaType): Link[] {
  const selector = `link[rel="${relationshipType}"]`;
  const elements = element.querySelectorAll(selector);

  if (elements === null) {
    log.warn('No links for the api found in document/element');
    return [];
  }

  // Trouble iterating a NodeListOf<Element>
  // so have fallen back to old school for instead of map
  const links: Link[] = [];

  for (const el of elements as any) {
    links.push({
      href: el.href,
      rel: el.rel,
      type: el.type,
    });
  }

  return filterLinks(links, relationshipType, mediaType);
}

/**
 * Map the list of child <link> elements from the given JSON representation.
 *
 * @return an array of links that match
 * @private
 */
function filterRepresentation(
  representation: LinkedRepresentation,
  relationshipType: RelationshipType,
  mediaType: MediaType,
): Link[] {
  if (representation.links) {
    return filterLinks(representation.links, relationshipType, mediaType);
  }
  return []; // No links member on the object, so nothing matches
}

/**
 * A helper to log out readable error messages
 * @private
 */
function makeNotFoundMessage(links: LinkType, relationshipType: RelationshipType, mediaType?: MediaType): string {
  const allLinks = filter(links, '*', '*');
  let mediaTypeDetails = ' (' + mediaType + ')';
  if (!mediaType) {
    mediaTypeDetails = '';
  }

  return (
    "The semantic interface '" +
    relationshipType +
    "'" +
    mediaTypeDetails +
    ' is not available. ' +
    allLinks.length +
    ' available links include ' +
    allLinks
      .map(link => {
        if (link.type && link.type !== '*' && link.type !== '*/*') {
          return '"' + link.rel + '" (' + link.type + ')';
        } else if (link.rel && link.rel.match(/self|canonical/)) {
          return '"self: ' + link.href + '"';
        } else {
          return '"' + link.rel + '"';
        }
      })
      .join(', ')
  );
}

/**
 * @private
 */
function logError(links: LinkType, relationshipType: RelationshipType, mediaType?: MediaType) {
  if (links == null) {
    log.error('Null or invalid object provided with semantic links information');
  } else {
    log.error(makeNotFoundMessage(links, relationshipType, mediaType));
  }
}

/**
 * A utility helper function to match a relationship type of media type string
 *
 * Match a link string if:
 *   - a regular  expression is used
 *   - the string is a special case wildcard string of '*'
 *   - the string matches the link string
 *
 * @private
 */
function matchParameter(linkString: string, matchString: string | RegExp): boolean {
  return (
    (linkString && matchString instanceof RegExp && !!linkString.match(matchString)) ||
    matchString === '*' ||
    matchString === '*/*' ||
    linkString === '*/*' ||
    linkString === matchString
  );
}

/**
 * A guard to detect whether the object is a {@link LinkedRepresentation}
 *
 * @see https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript
 * @param object
 * @returns whether the object is an instance on the interface
 * @private
 */
export function instanceOfLinkedRepresentation(object: any): object is LinkedRepresentation {
  if (object == null || typeof object === 'string') {
    return false;
  }
  return 'links' in object;
}

//  Public interface methods
//  ========================

/**
 * Get an array of links that match the given relationship type and media type,
 * where the link has a valid href.
 *
 * If the relationship types is an array then the matching types will be returned
 * in array order.
 *
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipTypes the descriptive attribute attached to define the type of link/relationships
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @return an array of links that match
 * @private
 */
export function filterLinks(links: LinkType, relationshipTypes: RelationshipType, mediaType?: MediaType): Link[] {
  // KLUDGE: must be a better way to to cast string|Regexp into explicit arrays
  if (typeof relationshipTypes === 'string') {
    relationshipTypes = [relationshipTypes];
  }

  if (relationshipTypes instanceof RegExp) {
    relationshipTypes = [relationshipTypes];
  }

  // magic bit of array flattening through casting (the map returns an array of array (single deep)
  // https://schneidenbach.gitbooks.io/typescript-cookbook/functional-programming/flattening-array-of-arrays.html
  return ([] as Link[]).concat(
    ...// KLUDGE: this little upcasting is to have 'map' available
    ((relationshipTypes as RegExp[] | string[]) as any[]).map(relationshipType => {
      if (links instanceof Array) {
        return links.filter(link => {
          const linkKeys = Object.keys(link);

          // start the match for 'href'
          if (linkKeys.some(x => x === 'href')) {
            // if it has a rel then be increasingly more specific
            if (linkKeys.some(x => x === 'rel')) {
              // sorry, ugly switching for typing
              // if we presented a rel, then it must match to be true
              const matchAsType =
                relationshipType instanceof RegExp ? (relationshipType as RegExp) : (relationshipType as string);

              if (!matchParameter(link.rel, matchAsType)) {
                return false; // relationship type doesn't match
              }
            }

            // if there is a 'type' then also be increasingly more specific
            if (linkKeys.some(x => x === 'type')) {
              // if we presented a type, then it must match to be true
              if (!matchParameter(link.type || '', mediaType || '')) {
                return false; // media type doesn't match
              }
            }

            // so, we have four potential conditions when up to three variables are presented
            //  1. href
            //  2. href & rel
            //  3. href & type
            //  4. href & rel & type
            return true; // it seems to match, and it has an url.
          }
          return false; // no match;
        });
      } else {
        log.warn('Array input expected - filterLinks');
        return []; // No links match the filter requirements.
      }
    }),
  );
}

/**
 * Query whether the 'links' has one or more link elements that match the given criteria.
 *
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @return whether there is one or more matching links
 */
export function matches(links: LinkType, relationshipType: RelationshipType, mediaType?: MediaType): boolean {
  return filter(links, relationshipType, mediaType).length > 0;
}

/**
 * Filter the list of links based on a relationship type and media type.
 * The result is an array of links objects.
 *
 * The results are not sorted. When multiple link entries are matched
 * then the order should not be assumed.
 *
 * Given a set of links (which can be in several forms), generate a
 * list of filtered links that match the given relation type and media type
 *
 * @param arg the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @return an array of links that match
 */
export function filter(arg: LinkType, relationshipType: RelationshipType, mediaType?: MediaType): Link[] {
  mediaType = mediaType || '*/*';

  if (arg instanceof Array) {
    // filter an array of JSON link objects
    return filterLinks(arg, relationshipType, mediaType);
  } else if (instanceOfLinkedRepresentation(arg)) {
    // Filter based on a representation with an array on 'links'
    return filterRepresentation(arg, relationshipType, mediaType);
  } else if (arg === 'HEAD') {
    // Filter 'link' elements from the 'head' element of the DOM, this is a
    // shortcut method so the caller doesn't have to express "$('HEAD')[0]"

    // NOTE: that the relationshipType is likely to be 'api'
    return filterDom(document.querySelectorAll('head')[0], relationshipType, mediaType);
  } else if (arg instanceof Element) {
    // Filter 'link' elements from the DOM
    return filterDom(arg, relationshipType, mediaType);
  }
  return [];
}

/**
 * Get the first 'href' that matches the filter criteria, or return undefined if there is no match
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param defaultValue empty string if not specified
 * @return The uri of the relationship
 */
export function getUri(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType?: MediaType,
  defaultValue?: string,
): Uri {
  const [link] = filter(links, relationshipType, mediaType);
  if (link) {
    return link.href;
  } else {
    logError(links, relationshipType, mediaType);
    return defaultValue || '';
  }
}

/**
 * Returns the tile from the first matched link
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @return The title of the relationship
 */
export function getTitle(links: LinkType, relationshipType: RelationshipType, mediaType?: MediaType): string {
  const [link] = filter(links, relationshipType, mediaType);
  if (link) {
    return link.title || '';
  } else {
    logError(links, relationshipType, mediaType);
    return '';
  }
}
