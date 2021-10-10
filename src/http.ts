import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Link } from './interfaces';
import LinkUtil, { LinkType, MediaType, RelationshipType } from './filter';
import anylogger from 'anylogger';

const log = anylogger('HttpUtil');

/**
 * Standard Http verbs
 */
type Verb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * The instance of {@link AxiosInstance} to use, which defaults to the global instance.
 */
let anAxios: AxiosInstance = axios as AxiosInstance;

/**
 * Provide a away for an application to specify the instance of {@link AxiosInstance} to use.
 *
 * Historically this library has used the global Axios instance. This means that any
 * defaults or interceptors configured must be on the same global instance. This is
 * quite manageable until the application code uses a different version of the library
 * and thus a different instance; which in turn will fail to use the configured defaults
 * and interceptors.
 */
export function useAxios(a: AxiosInstance): void {
    anAxios = a;
}


class HttpUtil {

    /**
     * Wrapper around axios to make the http request
     */
    private static httpRequest<TRequest, TResponse>(
        verb: Verb,
        item: Link,
        content: TRequest,
        contentType?: MediaType,
        options?: AxiosRequestConfig)
        : Promise<AxiosResponse<TResponse>> {
        log.debug('HTTP %s \'%s\'', verb, item.href);
        return anAxios({
            ...{
                cancelToken: options && options.cancelToken,
                data: content,
                method: verb,
                url: item.href,
            },
            //
            ...(content && contentType ? { headers: { 'Content-Type': contentType } } : {}),
            ...options,
        });
    }

    /**
     * HTTP/xhr utilities that wrap http. It particularly ensures `Accept` headers are set.
     *
     * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
     * @param relationshipType the descriptive attribute attached to define the type of link/relationship
     * @param verb action to take use across http {@link Verb}
     * @param content the across-the-wire representation
     * @param contentType
     * @param options?? axios request config for overrides
     * @return a promise containing the {@link LinkedRepresentation} in {@link AxiosResponse.data}
     * @private
     */
    private static link<TRequest, TResponse>(
        links: LinkType,
        relationshipType: RelationshipType,
        verb: Verb,
        content?: TRequest,
        contentType?: MediaType,
        options?: AxiosRequestConfig): Promise<AxiosResponse<TResponse>> {
        const aLink = LinkUtil.getLink(links, relationshipType);
        if (aLink && aLink.href) {
            return HttpUtil.httpRequest(verb, aLink, content, contentType, options);
        } else {
            return Promise.reject(new Error('The resource doesn\'t support the required interface'));
        }
    }


    /**
     * @param links the object that will contain the links to find. This is usually a {@link LinkedRepresentation}.
     * @param relationshipType the descriptive attribute attached to define the type of link/relationship
     * @param verb action to take use across http {@link Verb}
     * @param content the across-the-wire representation
     * @param contentType
     * @param defaultValue be able to return a {@link LinkedRepresentation} in the case of failure
     * @param options axios request config for overrides
     */
    private static tryLink<TRequest, TResponse>(
        links: LinkType,
        relationshipType: RelationshipType,
        verb: Verb,
        content: TRequest,
        contentType?: MediaType,
        defaultValue?: TResponse,
        options?: AxiosRequestConfig): Promise<AxiosResponse<TResponse>> {
        const aLink = LinkUtil.getLink(links, relationshipType);
        if (aLink && aLink.href) {
            return HttpUtil.httpRequest<TRequest, TResponse>(verb, aLink, content, contentType, options);
        } else {
            return Promise.resolve({
                data: defaultValue,
                headers: {},
                status: 200,
            } as AxiosResponse<TResponse>);
        }
    }

    /**
     * GET http request
     */
    public static get<TRequest, TResponse>(links: LinkType, relationshipType: RelationshipType, options?: AxiosRequestConfig):
        Promise<AxiosResponse<TResponse>> {
        return HttpUtil.link<TRequest, TResponse>(links, relationshipType, 'GET', undefined, undefined, options);
    }

    /**
     * GET http request and ensures that the request will not throw an Error.
     */
    public static tryGet<TResponse>(
        links: LinkType,
        relationshipType: RelationshipType,
        defaultValue?: TResponse,
        options?: AxiosRequestConfig): Promise<AxiosResponse<TResponse>> {
        return HttpUtil.tryLink<any, TResponse>(
            links,
            relationshipType,
            'GET',
            undefined,
            undefined,
            defaultValue,
            options);
    }

    /**
     * PUT http request
     */
    public static put<TRequest>(
        links: LinkType,
        relationshipType: RelationshipType,
        content: TRequest,
        contentType?: MediaType,
        options?: AxiosRequestConfig): Promise<AxiosResponse<void>> {
        return HttpUtil.link(links, relationshipType, 'PUT', content, contentType, options);
    }

    /**
     * POST http request
     */
    public static post<TRequest, TResponse>(
        links: LinkType,
        relationshipType: RelationshipType,
        content?: TRequest,
        contentType?: MediaType,
        options?: AxiosRequestConfig): Promise<AxiosResponse<TResponse>> {
        return HttpUtil.link(links, relationshipType, 'POST', content, contentType, options);
    }

    /**
     * Patch http request
     */
    public static patch<TRequest, TResponse>(
        links: LinkType,
        relationshipType: RelationshipType,
        content?: TRequest,
        contentType?: MediaType,
        options?: AxiosRequestConfig): Promise<AxiosResponse<TResponse>> {
        return HttpUtil.link(links, relationshipType, 'PATCH', content, contentType, options);
    }

    /**
     * DELETE http request
     */
    public static del(links: LinkType, relationshipType: RelationshipType): Promise<AxiosResponse<void>> {
        return HttpUtil.link(links, relationshipType, 'DELETE', undefined);
    }
}

/**
 * legacy export as a simple function.
 * @deprecated Use HttpUtil.get
 */
export const get = HttpUtil.get;
/**
 * legacy export as a simple function.
 * @deprecated Use HttpUtil.tryGet
 */
export const tryGet = HttpUtil.tryGet;
/**
 * legacy export as a simple function.
 * @deprecated Use HttpUtil.post
 */
export const post = HttpUtil.post;
/**
 * legacy export as a simple function.
 * @deprecated Use HttpUtil.put
 */
export const put = HttpUtil.put;
/**
 * legacy export as a simple function.
 * @deprecated Use HttpUtil.patch
 */
export const patch = HttpUtil.patch;
/**
 * legacy export as a simple function.
 * @deprecated Use HttpUtil.del
 */
export const del = HttpUtil.del;
/**
 * legacy export as a simple function, with a name which is a reserved word
 * @deprecated Use HttpUtil.del
 */
export { del as delete };

export default HttpUtil;
