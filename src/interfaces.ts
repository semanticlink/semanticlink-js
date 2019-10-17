/**
 * A link representation
 *
 * These names are based on the Atom Publishing Protocol and Syndication (micro)Format
 *
 * @see https://tools.ietf.org/html/rfc5023
 * @see https://tools.ietf.org/html/rfc4287
 *
 * @example
 *
 * In JSON:
 *
 *       {
 *           links: [
 *             { rel: "self", href:"https://api.example.com/todo/1"}
 *             { rel: "tags", href:"https://api.example.com/todo/1/tags" },
 *             { rel: "edit-form", href:"https://api.example.com/todo/edit/form", type:"application/json-patch+json" },
 *           ],
 *           ...
 *       }
 */
export interface Link {
    /**
     * A well known (or custom) relationship types e.g `collection`, `first`, `self`, `item`
     */
    rel: string;
    /**
     * The URI (location) of the representation in which to perform HTTP verbs e.g GET, POST, PUT, DELETE, PATCH, OPTIONS
     */
    href: string;
    /**
     * A well known mime type. e.g. `application/json`, `text/html`, `text/uri-list`
     */
    type?: string;
    /**
     * An arbitrary string that can be used for human readable aspects or machine categorisation
     */
    title?: string;
}

/**
 * A representation of a resource with links. Domain specific representations should implement this class
 * @example
 *
 * Typescript
 *
 *       interface TodoRepresentation implements LinkedRepresentation {
 *            name: string;
 *            completed: boolean;
 *        }
 *
 * @example
 *
 * jsdoc class doc
 *
 *      /**
 *      * @class TodoRepresentation
 *      * @extends LinkedRepresentation@property {string} name
 *      * @property {string} name
 *      * @property {boolean} completed
 *      * /
 * @example
 *
 * JSON/javascript
 *
 *       {
 *           links: [
 *             { rel: "self", href:"https://api.example.com/todo/1"}
 *           ],
 *           name: "First Resource",
 *           completed: true
 *       }
 */
export interface LinkedRepresentation {
    links: Link[];
}

export interface FeedItemRepresentation {
    /**
     * Uri of the resource in the collection
     */
    id: string;
    /**
     * Title of the resource
     */
    title?: string;
}

/**
 * This is a virtual representation (that should never be used across the wire). It is
 * used as a client side representation of a collection of homogeneous {@link LinkedRepresentation}s
 * that are from a {@link FeedRepresentation}.
 *
 * The individual items can be sparse (where the {@link LinkedRepresentation} is constructed from
 * the id and title of the {@link FeedItemRepresentation}) or fully populated where the representation
 * is obtained from the origin server.
 *
 * A representation of a collection of resources.
 *
 * @see {@link FeedRepresentation}
 */
export interface CollectionRepresentation<T extends LinkedRepresentation = LinkedRepresentation> extends LinkedRepresentation {
    /**
     * Set of entries for a collection. This the sparsely populated list that has a
     * machine readable and human readable identity
     *
     * @example
     *
     * In JSON:
     *
     * {
     *  links: ...
     *  items: [
     *    {
     *      id: "http://example.com/todo/1",  <-- machine-readable id
     *      title: "First Resource"           <-- human-readable identifier
     *  ]
     * }
     */
    items: T[];
}

/**
 * A representation of a feed resource (i.e. a collection of resources). The links
 * may contain links to 'next', 'previous', 'first' and 'last' This representation is
 * for across-the-wire {@link CollectionRepresentation} that are sparsely populated as {@link FeedItemRepresentation}
 * (ie they have `id` and `title`. At the point of becoming in-memory the {@link FeedItemRepresentation} becomes then a
 * sparsely populated {@link LinkedRepresentation} with the link rel (self) equal to the `id` and title as an attribute.
 * This implementation is not part of the semantic link utility library.
 */
export interface FeedRepresentation extends LinkedRepresentation {
    /**
     * WARNING: This field is used for both
     *   the wire level value as a {@link FeedItemRepresentation} and the in-memory (client) representation as the
     *   resource of the given type with a base type of {@link LinkedRepresentation}
     */
    items: FeedItemRepresentation[];
}

/**
 * A form used to describe the format of a representation for perform a POST.
 */
export interface GroupItemRepresentation extends FormItemRepresentation {
    items: FormItemRepresentation;
}

export interface FormItemRepresentation {
    id: string;
    type: string;
    name: string;
    description: string;
    items: FormItemRepresentation;
}
