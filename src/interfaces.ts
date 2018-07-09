/**
 * A link representation
 *
 * These names are based on the Atom Publishing Protol and Syndication (micro)Format
 *
 * @see https://tools.ietf.org/html/rfc5023
 * @see https://tools.ietf.org/html/rfc4287
 */
export declare interface Link {
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
 * A representation of a resource with links.
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
 * A representation of a collection of resources. The links
 * may contain links to 'next', 'previous', 'first' and 'last'.
 */
export interface CollectionRepresentation extends LinkedRepresentation {
  /**
   * Set of entries for a collection. This the sparsely populated list that has a
   * machine readable and human readable identity
   *
   * @example
   *
   * In Json:
   *
   * {
   *  links: ...
   *  items: [
   *    {
   *      id: "http://example.com/resource/1",  <-- machine-readable id
   *      title: "First Resource"               <-- human-readable identifier
   *  ]
   * }
   */
  items: LinkedRepresentation[];
}

/**
 * A representation of a feed resource (i.e. a collection of resources). The links
 * may contain links to 'next', 'previous', 'first' and 'last'.
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
