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

/**************************************************
 *                                                *
 *  Project : SIM-FETCH                           *
 *                                                *
 *  Year : 2025                                   *
 *                                                *
 **************************************************/

import { createError } from './utils/error';
import { IFetch, IOption } from './utils/types';

const MAX_RETRIES: number = 5;
const RETRY_DELAY: number = 1000;
const CACHE_TTL: number = 60000; // Cache TTL => 1 minute

export class SimFetch {
	private readonly baseUrl: string;
	private readonly options: Record < string, any > ;
	private readonly timeout: number;
	private readonly retry: boolean;
	private readonly retryNum: number;
	private cache: Record < string, { response: Response;timestamp: number } > ;
	
	constructor(config: IFetch) {
		this.baseUrl = config.baseUrl;
		this.options = config.options || {};
		this.timeout = config.timeout || 5000; // Default timeout => 5secs
		this.retry = config.retry || true;
		this.retryNum = config.retryNumber || 5;
		this.cache = {};
	}
	
	public async create(path: string, options ? : IOption): Promise < Response > {
		const url = `${this.baseUrl}${path}`;
		const fetchOptions = { ...this.options, ...options };
		return this._fetch(url, fetchOptions);
	}
	
	private async _retry(fn: () => Promise < Response > , retries = MAX_RETRIES, delay = RETRY_DELAY): Promise < Response > {
		try {
			return await fn();
		} catch (error) {
			if (retries === 0) throw error;
			
			if (!error.response || ![408, 500, 502, 503, 504].includes(error.response.status)) {
				throw error;
			}
			// delay before retrying
			await new Promise(resolve => setTimeout(resolve, delay));
			return this._retry(fn, retries - 1, delay * 2); // delay the retry by x 2 of previous delay
		}
	}
	
	private async _fetch(url: string, options ? : IOption): Promise < Response > {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);
		
		const fetchWithRetry = async () => {
			try {
				const response = await fetch(url, { ...options, signal: controller.signal });
				clearTimeout(timeoutId);
				
				if (!response.ok) {
					let errorData: any;
					
					// Try to parse the response as JSON
					try {
						errorData = await response.json();
					} catch (jsonError) {
						// If JSON parsing fails, try to parse it as text
						try {
							errorData = await response.text();
						} catch (textError) {
							// If both JSON and text parsing fail, use a fallback message
							errorData = 'Response type not known';
						}
					}
					throw createError(response.status, errorData);
				}
				
				return response;
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') {
					throw createError(408, 'Request timed out. Please check your network connection.');
				}
				console.error('Fetch error:', error);
				throw error;
			}
		};
		return this._retry(fetchWithRetry);
	}
	
	public async get(path: string, options ? : IOption): Promise < Response > {
		const url = `${this.baseUrl}${path}`;
		const cacheKey = `${url}:${JSON.stringify(options)}`;
		
		// Check if the response is in the cache and not expired
		if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < CACHE_TTL) {
			return this.cache[cacheKey].response.clone();
		}
		
		// If not in cache or expired, make the request
		const response = await this.create(path, {
			method: 'GET',
			...options
		});
		
		// Store the response in the cache
		this.cache[cacheKey] = {
			response: response.clone(),
			timestamp: Date.now()
		};
		
		return response;
	}
	
	public post < T > (path: string, data: any | Record < string, any > , options ? : IOption): Promise < Response > {
		return this.create(path, {
			method: 'POST',
			body: JSON.stringify < T > (data),
			...options
		});
	}
	
	public put < T > (path: string, data: any | Record < string, any > , options ? : IOption): Promise < Response > {
		return this.create(path, {
			method: 'PUT',
			body: JSON.stringify < T > (data),
			...options
		});
	}
	
	public delete(path: string, options ? : IOption): Promise < Response > {
		return this.create(path, {
			method: 'DELETE',
			...options
		});
	}
	
	public async json < T > (path: string, options ? : Record < string, any > ): Promise < T > {
		const response = await this.create(path, options);
		return response.json() as T;
	}
	
	public async text(path: string, options ? : Record < string, any > ): Promise < string > {
		const response = await this.create(path, options);
		return response.text();
	}
	
	public async blob(path: string, options ? : Record < string, any > ): Promise < Blob > {
		const response = await this.create(path, options);
		return response.blob();
	}
	
	public async arrayBuffer(path: string, options ? : Record < string, any > ): Promise < ArrayBuffer > {
		const response = await this.create(path, options);
		return response.arrayBuffer();
	}
	
	
	public async stream(path: string, options ? : IOption): Promise < ReadableStream < Uint8Array >> {
		const response = await this.create(path, options);
		if (!response.body) {
			throw new Error('Response body is not available for streaming.');
		}
		return response.body;
	}
	
	public clearCache(): void {
		this.cache = {};
	}
}