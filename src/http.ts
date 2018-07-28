import axios, { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios';
import {
  CollectionRepresentation,
  filter,
  Link,
  LinkedRepresentation,
  LinkType,
  MediaType,
  RelationshipType,
} from './index';

/**
 * Standard Http verbs
 */
type Verb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Wrapper type around the axios {@link CancelToken}
 */
export type Cancellable = CancelToken;

/**
 * Optional type that allows a param shifting
 */

/**
 * As we do requests there are loads of media types that might be sent.
 *
 * @example
 *
 * - json
 * - form encoded
 * - text/url-list
 */
export type AcrossTheWire = LinkedRepresentation | CollectionRepresentation | any;

/**
 * User Defined Type Guards
 */

/**
 *
 * @param arg
 * @returns {boolean}
 */
function isCancellable(arg: any): arg is Cancellable {
  return arg && arg.promise !== undefined;
}

/**
 * This is always used in conjunction with {@link isCancellable} and thus checks it isn't one of those
 *
 * @alias !isCancellable
 * @param arg
 * @returns {boolean}
 */
function isLinkedRepresentation(arg: any): arg is LinkedRepresentation {
  return arg && arg.links !== undefined;
}

/**
 * This is always used in conjunction with {@link isCancellable} and thus checks it isn't one of those
 *
 * @alias !isCancellable
 * @param arg
 * @returns {boolean}
 */
function isMediaType(arg: any): arg is MediaType {
  return arg && typeof arg === 'string';
}

/**
 * Wrapper around axios to make the http request
 * @param {CancelToken} cancellable
 * @param {LinkedRepresentation} data
 * @param {Verb} verb
 * @param {Link} item
 * @param {MediaType} mediaType
 * @param options axios request config for overrides
 * @returns {AxiosPromise}
 * @private
 */
function httpRequest(
  cancellable: CancelToken,
  data: LinkedRepresentation,
  verb: Verb,
  item: Link,
  mediaType: MediaType,
  options?: AxiosRequestConfig,
): AxiosPromise {
  return axios({
    ...{
      cancelToken: cancellable,
      data,
      method: verb,
      url: item.href,
    },
    ...(data && mediaType ? { headers: { 'Content-Type': mediaType } } : {}),
    ...options,
  });
}

/**
 * HTTP/xhr utilities that wrap http. It particularly ensures `Accept` headers are set.
 *
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param verb action to take use across http {@link Verb}
 * @param data the across-the-wire representation
 * @param cancellable a cancellable token to clear requests in the queue
 * @param options axios request config for overrides
 * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
 * @private
 */
export function link(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType: MediaType,
  verb: Verb,
  data: AcrossTheWire,
  cancellable?: Cancellable,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<LinkedRepresentation | CollectionRepresentation>> {
  const [item] = filter(links, relationshipType, mediaType);
  if (item && item.href) {
    return httpRequest(cancellable as CancelToken, data, verb, item, mediaType, options);
  } else {
    return Promise.reject(new Error("The resource doesn't support the required interface"));
  }
}

/**
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param verb action to take use across http {@link Verb}
 * @param data the across-the-wire representation
 * @param cancellable a cancellable token to clear requests in the queue
 * @param defaultValue be able to return a {@link LinkedRepresentation} in the case of failure
 * @param options axios request config for overrides
 * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
 * @private
 */
export function tryLink(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType: MediaType,
  verb: Verb,
  data: AcrossTheWire,
  cancellable?: Cancellable,
  defaultValue?: LinkedRepresentation,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<LinkedRepresentation | CollectionRepresentation>> {
  const [item] = filter(links, relationshipType, mediaType as MediaType);
  if (item && item.href) {
    return httpRequest(cancellable as CancelToken, data, verb, item, mediaType, options);
  } else {
    return Promise.resolve({
      data: defaultValue as LinkedRepresentation,
      headers: [],
      status: 200,
    } as AxiosResponse);
  }
}

/**
 * GET http request
 *
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param cancellable a cancellable token to clear requests in the queue
 * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
 */
export function get(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType?: MediaType | Cancellable,
  cancellable?: Cancellable,
): Promise<AxiosResponse<LinkedRepresentation | CollectionRepresentation>> {
  if (isCancellable(mediaType)) {
    cancellable = mediaType as Cancellable;
    mediaType = undefined;
  }

  return link(links, relationshipType, mediaType as MediaType, 'GET', {} as LinkedRepresentation, cancellable);
}

/**
 * GET http request and ensures that the request will not throw an Error.
 *
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param cancellable a cancellable token to clear requests in the queue
 * @param defaultValue be able to return a {@link LinkedRepresentation} in the case of failure
 * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
 */
export function tryGet(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType?: MediaType | Cancellable | LinkedRepresentation,
  cancellable?: Cancellable | LinkedRepresentation,
  defaultValue?: LinkedRepresentation,
): Promise<AxiosResponse<LinkedRepresentation | CollectionRepresentation>> {
  if (isCancellable(mediaType)) {
    defaultValue = cancellable as LinkedRepresentation;
    cancellable = mediaType as Cancellable;
    mediaType = undefined;
  }

  if (isLinkedRepresentation(mediaType)) {
    defaultValue = mediaType as LinkedRepresentation;
    mediaType = undefined;
    cancellable = undefined;
  }

  if (isLinkedRepresentation(cancellable)) {
    defaultValue = cancellable as LinkedRepresentation;
    cancellable = undefined;
  }

  return tryLink(
    links,
    relationshipType,
    mediaType as MediaType,
    'GET',
    {} as LinkedRepresentation,
    cancellable,
    defaultValue,
  );
}

/**
 * PUT http request
 *
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param data the across-the-wire representation
 * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
 */
export function put(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType: MediaType | AcrossTheWire,
  data?: AcrossTheWire,
): Promise<AxiosResponse<LinkedRepresentation | CollectionRepresentation>> {
  if (data === undefined) {
    data = mediaType as AcrossTheWire;
    mediaType = undefined;
  }

  return link(links, relationshipType, mediaType, 'PUT', data);
}

/**
 * POST http request
 *
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param data the across-the-wire representation
 * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
 */

export function post(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType: MediaType | AcrossTheWire,
  data?: AcrossTheWire,
): Promise<AxiosResponse<LinkedRepresentation | CollectionRepresentation>> {
  if (data === undefined) {
    data = mediaType as AcrossTheWire;
    mediaType = undefined;
  }

  return link(links, relationshipType, mediaType, 'POST', data);
}

/**
 * Patch http request
 *
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param data the across-the-wire representation
 * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
 */

export function patch(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType: MediaType | AcrossTheWire,
  data?: AcrossTheWire,
): Promise<AxiosResponse<LinkedRepresentation | CollectionRepresentation>> {
  if (data === undefined) {
    data = mediaType as AcrossTheWire;
    mediaType = undefined;
  }

  return link(links, relationshipType, mediaType, 'PATCH', data);
}

/**
 * DELETE http request
 *
 * @alias delete
 * @alias _delete
 * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
 * @param relationshipType the descriptive attribute attached to define the type of link/relationship
 * @param mediaType the  media (mime) type identifier of the resource. Default is * / *
 * @param data the across-the-wire representation
 * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
 */
export function del(
  links: LinkType,
  relationshipType: RelationshipType,
  mediaType?: MediaType | AcrossTheWire,
  data?: AcrossTheWire,
): Promise<AxiosResponse<LinkedRepresentation | CollectionRepresentation>> {
  if (!isMediaType(mediaType)) {
    data = mediaType as AcrossTheWire;
    mediaType = undefined;
  }
  return link(links, relationshipType, mediaType, 'DELETE', data);
}

/**
 * Alias to get around reserved works on function. Can used with import
 *
 * @example
 *
 * import * as semanticLink from 'semantic-link'
 *
 * semanticLink.delete(resource, rel);
 */
export { del as delete };

/**
 * @alias del
 * @deprecated use del
 */
export { del as _delete };
