"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimFetchX = void 0;
/**************************************************
 *                                                *
 *  Project : SIM-FETCH                           *
 *                                                *
 *  Year : 2025                                   *
 *                                                *
 **************************************************/
const error_1 = require("./utils/error");
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;
const CACHE_TTL = 60000; // Cache TTL => 1 minute
class SimFetchX {
    constructor(config) {
        // Type guard for our expected error shape
        this.isHttpError = (err) => {
            return typeof err === 'object' && err !== null && 'response' in err;
        };
        this.baseUrl = config.baseUrl;
        this.options = config.options || {};
        this.timeout = config.timeout || 5000; // Default timeout => 5secs
        this.retry = config.retry || true;
        this.retryNum = config.retryNumber || 5;
        this.cache = {};
    }
    create(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseUrl}${path}`;
            const fetchOptions = Object.assign(Object.assign({}, this.options), options);
            return this._fetch(url, fetchOptions);
        });
    }
    _retry(fn_1) {
        return __awaiter(this, arguments, void 0, function* (fn, retries = MAX_RETRIES, delay = RETRY_DELAY) {
            var _a;
            try {
                return yield fn();
            }
            catch (error) {
                if (retries === 0)
                    throw error;
                if (!this.isHttpError(error) || !(error === null || error === void 0 ? void 0 : error.response) || ![408, 500, 502, 503, 504].includes((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status)) {
                    throw error;
                }
                // delay before retrying
                yield new Promise(resolve => setTimeout(resolve, delay));
                return this._retry(fn, retries - 1, delay * 2); // delay the retry by x 2 of previous delay
            }
        });
    }
    _fetch(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            const fetchWithRetry = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        let errorData;
                        // Try to parse the response as JSON
                        try {
                            errorData = yield response.json();
                        }
                        catch (jsonError) {
                            // If JSON parsing fails, try to parse it as text
                            try {
                                errorData = yield response.text();
                            }
                            catch (textError) {
                                // If both JSON and text parsing fail, use a fallback message
                                errorData = 'Response type not known';
                            }
                        }
                        throw (0, error_1.createError)(response.status, errorData);
                    }
                    return response;
                }
                catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') {
                        throw (0, error_1.createError)(408, 'Request timed out. Please check your network connection.');
                    }
                    console.error('Fetch error:', error);
                    throw error;
                }
            });
            return this._retry(fetchWithRetry);
        });
    }
    get(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseUrl}${path}`;
            const cacheKey = `${url}:${JSON.stringify(options)}`;
            // Check if the response is in the cache and not expired
            if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < CACHE_TTL) {
                return this.cache[cacheKey].response.clone();
            }
            // If not in cache or expired, make the request
            const response = yield this.create(path, Object.assign({ method: 'GET' }, options));
            // Store the response in the cache
            this.cache[cacheKey] = {
                response: response.clone(),
                timestamp: Date.now()
            };
            return response;
        });
    }
    post(path, data, options) {
        return this.create(path, Object.assign({ method: 'POST', body: JSON.stringify(data) }, options));
    }
    put(path, data, options) {
        return this.create(path, Object.assign({ method: 'PUT', body: JSON.stringify(data) }, options));
    }
    delete(path, options) {
        return this.create(path, Object.assign({ method: 'DELETE' }, options));
    }
    json(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.create(path, options);
            return response.json();
        });
    }
    text(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.create(path, options);
            return response.text();
        });
    }
    blob(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.create(path, options);
            return response.blob();
        });
    }
    arrayBuffer(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.create(path, options);
            return response.arrayBuffer();
        });
    }
    stream(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.create(path, options);
            if (!response.body) {
                throw new Error('Response body is not available for streaming.');
            }
            return response.body;
        });
    }
    clearCache() {
        this.cache = {};
    }
}
exports.SimFetchX = SimFetchX;
