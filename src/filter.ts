import anylogger from 'anylogger';
import { Link, LinkedRepresentation } from './interfaces';

const log = anylogger('FilterUtil');

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
export type MediaType = string | undefined;

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
export type RelationshipType = string | RegExp | string[] | RegExp[] | LinkSelector | LinkSelector[];

/**
 * This is a search criteria to allow the selection/filtering of link representations.
 */
export interface LinkSelector {
    /**
     * A mandatory link relation name or regular expression.
     */
    rel: string | RegExp;

    /**
     * An optional expression (string or regular expression) to match link media type.
     */
    mediaType?: string | RegExp;

    /**
     * An optional title to match the title
     */
    title?: string | RegExp;
}

/**
 * A type guard for a {@link LinkSelector}
 *
 * @see {@link http://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types}
 */
export function instanceOfLinkSelector(item: any): item is LinkSelector {

    if (isNullOrUndefined(item)|| item === '') {
        return false;
    }
    const asItem = item as LinkSelector;
    return asItem && (asItem).rel !== undefined;
}

/**
 * A guard to detect whether the object is a {@link LinkedRepresentation}. A linked representation
 * must be an object with an array called 'links'.
 *
 * @see https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript
 * @param object
 * @returns whether the object is an instance on the interface
 */
export function instanceOfLinkedRepresentation(object: any): object is LinkedRepresentation {
    const asObject = object as LinkedRepresentation;
    return !!(asObject && typeof object !== 'string' && Array.isArray(object.links));
}

/**
 * Perform a 'juggling-check' to determine if the parameter is null or undefined. If the
 * parameter is a number then zero will return true. If the parameter is a string then
 * an empty string will return true.
 *
 * This is equivalent to: `x === null || typeof x === 'undefined'`
 *
 * see
 *  - https://stackoverflow.com/a/28984306
 */
export function isNullOrUndefined(x: any): x is undefined {
    return x == null;
}

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


interface WeightedMatch {
    link: Link;
    weight: number;
}

const MaxWeight = 99999;

/**
 * Check if the code is running in a browser environment.
 */
function isBrowserEnvironment(globalThis:any): boolean {
    try {
        return globalThis === window;
    } catch (e) {
        return false;
    }
}
const isBrowser = isBrowserEnvironment(this);


class LinkUtil {
    /**
     * Get the first 'href' that matches the filter criteria, or return undefined if there is no match
     * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
     * @param relationshipType the descriptive attribute attached to define the type of link/relationship
     * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
     * @param defaultValue empty string if not specified
     * @return The uri of the relationship
     */
    public static getUri(
            links: LinkType,
            relationshipType: RelationshipType,
            mediaType?: MediaType,
            defaultValue?: string | undefined): Uri | undefined {
        const [link] = LinkUtil.filter(links, relationshipType, mediaType);
        if (link) {
            return link.href;
        } else {
            LinkUtil.logError(links, relationshipType, mediaType);
            return defaultValue;
        }
    }

    /**
     * Get the first link that matches the filter criteria, or return undefined if there is no match
     * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
     * @param relationshipType the descriptive attribute attached to define the type of link/relationship
     * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
     * @param defaultValue empty string if not specified
     * @return The uri of the relationship
     */
    public static getLink(
            links: LinkType,
            relationshipType: RelationshipType,
            mediaType?: MediaType,
            defaultValue?: Link): Link | undefined {
        const [link] = LinkUtil.filter(links, relationshipType, mediaType);
        if (link) {
            return link;
        } else {
            LinkUtil.logError(links, relationshipType, mediaType);
            return defaultValue;
        }
    }

    /**
     * Query whether the 'links' has one or more link elements that match the given criteria.
     *
     * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
     * @param relationshipType the descriptive attribute attached to define the type of link/relationship
     * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
     * @return whether there is one or more matching links
     */
    public static matches(links: LinkType, relationshipType: RelationshipType, mediaType?: MediaType): boolean {
        return LinkUtil.filter(links, relationshipType, mediaType).length > 0;
    }

    /**
     * Returns the tile from the first matched link
     * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
     * @param relationshipType the descriptive attribute attached to define the type of link/relationship
     * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
     * @return The title of the relationship
     */
    public static getTitle(links: LinkType, relationshipType: RelationshipType, mediaType?: MediaType): string {
        const [link] = LinkUtil.filter(links, relationshipType, mediaType);
        if (link) {
            return link.title || '';
        } else {
            LinkUtil.logError(links, relationshipType, mediaType);
            return '';
        }
    }

    /**
     * Get an array of links that match the given relationship type and media type,
     * where the link has a valid href.
     *
     * If the relationship types is an array then the matching types will be returned
     * in array order.
     *
     * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
     * @param rels the descriptive attribute attached to define the type of link/relationships
     * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
     * @return an array of links that match
     */
    public static filterLinks(links: Link[], rels: RelationshipType, mediaType?: MediaType): Link[] {

        function matchSingle(link: Link, selector: LinkSelector): boolean {
            // if we presented a rel, then it must match to be true
            if (LinkUtil.matchParameter(link.rel, selector.rel)) {

                const titleIsAMatchOrNotRequired = isNullOrUndefined(selector.title) ||
                        (LinkUtil.matchParameter(link.title || '', selector.title));
                const mediaTypeIsAMatchOrNotRequired = isNullOrUndefined(selector.mediaType) ||
                        (LinkUtil.matchParameter(link.type || '', selector.mediaType));
                if (titleIsAMatchOrNotRequired && mediaTypeIsAMatchOrNotRequired) {
                    return true;
                }
            }
            return false;
        }

        const selectors = LinkUtil.makeSelectors(rels, mediaType);
        return links
                .map<WeightedMatch>((link: Link) => {
                    // Check the link is valid in that it has an href and rel (relationship)
                    if (link.href && link.rel) {
                        // Enumerate selectors until one is found that it a match. Record the
                        // index of matching selector to use as a weighting.
                        for (let selectorIndex = 0; selectorIndex < selectors.length; ++selectorIndex) {
                            if (matchSingle(link, selectors[selectorIndex])) {
                                return { link, weight: selectorIndex };
                            }
                        }
                    }
                    return { link, weight: MaxWeight }; // no match;
                })
                .filter((match: WeightedMatch) => match.weight < MaxWeight)
                .sort((l: WeightedMatch, r: WeightedMatch) => l.weight - r.weight)
                .map<Link>((match: WeightedMatch) => match.link);
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
    public static filter(arg: LinkType, relationshipType: RelationshipType, mediaType?: MediaType): Link[] {
        if (arg instanceof Array) {
            // filter an array of JSON link objects
            return LinkUtil.filterLinks(arg, relationshipType, mediaType);
        } else if (instanceOfLinkedRepresentation(arg)) {
            // Filter based on a representation with an array on 'links'
            return LinkUtil.filterRepresentation(arg, relationshipType, mediaType);
        } else if (arg === 'HEAD') {
            // Filter 'link' elements from the 'head' element of the DOM, this is a
            // shortcut method so the caller doesn't have to express "$('HEAD')[0]"

            // NOTE: that the relationshipType is likely to be 'api'
            return LinkUtil.filterDom(document.querySelectorAll('head')[0], relationshipType, mediaType);
        } else if (isBrowser && arg instanceof Element) {
            // Filter 'link' elements from the DOM
            return LinkUtil.filterDom(arg, relationshipType, mediaType);
        }
        return [];
    }


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
     */
    private static filterDom(element: Document | Element, relationshipType: RelationshipType, mediaType: MediaType): Link[] {
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

        return LinkUtil.filterLinks(links, relationshipType, mediaType);
    }

    /**
     * Map the list of child <link> elements from the given JSON representation.
     *
     * @return an array of links that match
     */
    private static filterRepresentation(
            representation: LinkedRepresentation,
            relationshipType: RelationshipType,
            mediaType: MediaType): Link[] {
        if (representation.links) {
            return LinkUtil.filterLinks(representation.links, relationshipType, mediaType);
        }
        return []; // No links member on the object, so nothing matches
    }

    /**
     * A helper to log out readable error messages
     */
    private static makeNotFoundMessage(
            links: LinkType,
            relationshipType: RelationshipType,
            mediaType?: MediaType): string {
        const allLinks = LinkUtil.filter(links, '*', '*');
        let mediaTypeDetails = ` (${mediaType})`;
        if (!mediaType) {
            mediaTypeDetails = '';
        }

        function linkName(link: Link): string {
            if (link.type && link.type !== '*' && link.type !== '*/*') {
                return `"${link.rel}" (${link.type})`;
            } else if (link.rel && link.rel.match(/self|canonical/)) {
                return `"self: ${link.href}"`;
            } else {
                return `"${link.rel}"`;
            }
        }

        return `The semantic interface '${relationshipType}'${mediaTypeDetails} is not available. ${allLinks.length} available links include ${allLinks.map(linkName).join(', ')}`;
    }

    /**
     */
    private static logError(links: LinkType, relationshipType: RelationshipType, mediaType?: MediaType) {
        if (links == null) {
            log.error('Null or invalid object provided with semantic links information');
        } else {
            log.debug(LinkUtil.makeNotFoundMessage(links, relationshipType, mediaType));
        }
    }

    /**
     * A utility helper function to match a relationship type of media type string
     *
     * Match a link string if:
     *   - a regular  expression is used
     *   - the string is a special case wildcard string of '*'
     *   - the string matches the link string
     */
    private static matchParameter(linkString: string, matchString: string | RegExp): boolean {
        return (
                (linkString && matchString instanceof RegExp && !!linkString.match(matchString)) ||
                matchString === '*' ||
                matchString === '*/*' ||
                linkString === '*/*' ||
                linkString === matchString ||
                // explicit media types must limit and find specified link types
                (matchString !== null && matchString !== '*/*' && matchString !== '*' && linkString === matchString)
        );
    }


    /**
     * Normalise all the different options for making a selection into a standardised
     * array of {@link LinkSelector}.
     *
     * Individual items are converted to singleton array. When the singleton is an string or
     * RegExp the legacy style separate mediaType is added to the selector. If a newer style
     * selector is provided then the mediaType is ignored (and should be undefined/null).
     *
     * For arrays, heterogeneous array are converted to a homogeneous array of LinkSelector
     * items.
     *
     * Note: If a homogeneous array of {@link LinkSelector} is provided, then this will return
     * that value unmodified.
     */
    private static makeSelectors(rels: RelationshipType, mediaType?: MediaType): LinkSelector[] {
        if (typeof rels === 'string') {
            return [{ rel: rels, mediaType } as LinkSelector];
        }
        if (rels instanceof RegExp) {
            return [{ rel: rels, mediaType } as LinkSelector];
        }
        // Convert a single LinkSelector to an array
        if (instanceOfLinkSelector(rels)) {
            return [rels as LinkSelector];
        }

        // Normalise arrays of strings/RegExp/LinkSelector
        if (Array.isArray(rels)) {
            // Check for a homogeneous array of LinkSelector
            if (rels.every((rel: any) => instanceOfLinkSelector(rel))) {
                return rels as LinkSelector[];
            }
            return (rels as (RegExp | string | LinkSelector)[])
                    .map<LinkSelector>((item: RegExp | string | LinkSelector) => {
                        if (typeof item === 'string') {
                            return { rel: item as string, mediaType } as LinkSelector;
                        }

                        if (item instanceof RegExp) {
                            return { rel: item, mediaType } as LinkSelector;
                        }

                        if (instanceOfLinkSelector(item)) {
                            return item as LinkSelector;
                        }
                        throw new Error(`Unsupported link relationship selector`);
                    }) as LinkSelector[];
        }
        throw new Error(`Unsupported link relationship selector`);
    }
}

export const filterLinks = LinkUtil.filterLinks;
export const matches = LinkUtil.matches;
export const filter = LinkUtil.filter;
export const getUri = LinkUtil.getUri;
export const getTitle = LinkUtil.getTitle;
export default LinkUtil;
