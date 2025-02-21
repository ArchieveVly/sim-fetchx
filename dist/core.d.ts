/**************************************************
 *  MIT License                                   *
 *                                                *
 *  Copyright (c) 2025 Kaneki Vly                 *
 *                                                *
 *  Permission is hereby granted, free of charge, *
 *  to any person obtaining a copy of this        *
 *  software and associated documentation files   *
 *  (the "Software"), to deal in the Software     *
 *  without restriction, including without        *
 *  limitation the rights to use, copy, modify,  *
 *  merge, publish, distribute, sublicense,      *
 *  and/or sell copies of the Software, and to    *
 *  permit persons to whom the Software is        *
 *  furnished to do so, subject to the following  *
 *  conditions:                                   *
 *                                                *
 *  The above copyright notice and this           *
 *  permission notice shall be included in all    *
 *  copies or substantial portions of the         *
 *  Software.                                     *
 *                                                *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT     *
 *  WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,     *
 *  INCLUDING BUT NOT LIMITED TO THE WARRANTIES   *
 *  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR  *
 *  PURPOSE AND NONINFRINGEMENT. IN NO EVENT      *
 *  SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE     *
 *  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER        *
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT,  *
 *  TORT OR OTHERWISE, ARISING FROM, OUT OF OR    *
 *  IN CONNECTION WITH THE SOFTWARE OR THE USE    *
 *  OR OTHER DEALINGS IN THE SOFTWARE.            *
 **************************************************/
import { IFetch, IOption } from './utils/types';
export declare class SimFetch {
    private readonly baseUrl;
    private readonly options;
    private readonly timeout;
    private readonly retry;
    private readonly retryNum;
    private cache;
    constructor(config: IFetch);
    create(path: string, options?: IOption): Promise<Response>;
    isHttpError: (err: unknown) => err is {
        response?: {
            status: number;
        } | undefined;
    };
    private _retry;
    private _fetch;
    get(path: string, options?: IOption): Promise<Response>;
    post(path: string, data: any | Record<string, any>, options?: IOption): Promise<Response>;
    put(path: string, data: any | Record<string, any>, options?: IOption): Promise<Response>;
    delete(path: string, options?: IOption): Promise<Response>;
    json<T>(path: string, options?: Record<string, any>): Promise<T>;
    text(path: string, options?: Record<string, any>): Promise<string>;
    blob(path: string, options?: Record<string, any>): Promise<Blob>;
    arrayBuffer(path: string, options?: Record<string, any>): Promise<ArrayBuffer>;
    stream(path: string, options?: IOption): Promise<ReadableStream<Uint8Array>>;
    clearCache(): void;
}
