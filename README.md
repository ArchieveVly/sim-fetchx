# API Documentation 

`SimFetch` is a lightweight 🚀, configurable ⚙️, and retry-enabled 🔄 HTTP client for making API requests. It supports caching 💾, retries 🔄, timeouts ⏳, and streaming 🌊, making it ideal for handling unreliable network conditions 📶 and large data transfers.


---

## Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
   - [Initialization](#initialization)
   - [Making Requests](#making-requests)
   - [Caching](#caching)
   - [Retries](#retries)
   - [Streaming](#streaming)
   - [Error Handling](#error-handling)
3. [API Methods](#api-methods)
   - [`get`](#get)
   - [`post`](#post)
   - [`put`](#put)
   - [`delete`](#delete)
   - [`json`](#json)
   - [`text`](#text)
   - [`blob`](#blob)
   - [`arrayBuffer`](#arraybuffer)
   - [`stream`](#stream)
   - [`clearCache`](#clearcache)
4. [Examples](#examples)
5. [License](#license)

---

## Installation ✳️

To use `SimFetch`, install it via npm:

```bash
npm install sim-fetch
```

---

## Usage

### Initialization ✳️

To start using `SimFetch`, create an instance by passing a configuration object.

```typescript
import { SimFetch } from 'sim-fetch';

const api = new SimFetch({
  baseUrl: 'https://api.example.com',
  timeout: 5000, // Optional: Default timeout is 5 seconds
  retry: true,   // Optional: Enable retries (default is true)
  retryNumber: 3, // Optional: Number of retries (default is 5)
  cacheTtl: 60000, // Optional: Cache TTL in milliseconds (default is 1 minute)
});
```

### Making Requests ✳️

Use the available methods (`get`, `post`, `put`, `delete`, etc.) to make HTTP requests.

### Caching

Responses are cached for 1 minute (default) to reduce redundant requests. You can clear the cache using `clearCache()`.

### Retries

If a request fails due to a server error (5xx) or timeout, `SimFetch` will automatically retry the request up to the specified number of times.

### Streaming ✳️

`SimFetch` supports streaming large responses using the `stream()` method. This is useful for downloading files or processing data in chunks.

### Error Handling

`SimFetch` provides detailed error handling, including status codes, error messages, and retry logic.

---

## API Methods 🕹️

### `get`

Makes a GET request.

```typescript
async get(path: string, options?: IOption): Promise<Response>
```

**Example:**
```typescript
const response = await api.get('/users');
const data = await response.json();
```

---

### `post`

Makes a POST request.

```typescript
async post<T>(path: string, data: any | Record<string, any>, options?: IOption): Promise<Response>
```

**Example:**
```typescript
const response = await api.post('/users', { name: 'John Doe' });
const result = await response.json();
```

---

### `put`

Makes a PUT request.

```typescript
async put<T>(path: string, data: any | Record<string, any>, options?: IOption): Promise<Response>
```

**Example:**
```typescript
const response = await api.put('/users/1', { name: 'Jane Doe' });
const result = await response.json();
```

---

### `delete`

Makes a DELETE request.

```typescript
async delete(path: string, options?: IOption): Promise<Response>
```

**Example:**
```typescript
const response = await api.delete('/users/1');
```

---

### `json`

Makes a request and parses the response as JSON.

```typescript
async json<T>(path: string, options?: Record<string, any>): Promise<T>
```

**Example:**
```typescript
const data = await api.json<User[]>('/users');
```

---

### `text`

Makes a request and parses the response as text.

```typescript
async text(path: string, options?: Record<string, any>): Promise<string>
```

**Example:**
```typescript
const text = await api.text('/document');
```

---

### `blob`

Makes a request and parses the response as a `Blob`.

```typescript
async blob(path: string, options?: Record<string, any>): Promise<Blob>
```

**Example:**
```typescript
const blob = await api.blob('/image');
```

---

### `arrayBuffer`

Makes a request and parses the response as an `ArrayBuffer`.

```typescript
async arrayBuffer(path: string, options?: Record<string, any>): Promise<ArrayBuffer>
```

**Example:**
```typescript
const buffer = await api.arrayBuffer('/file');
```

---

### `stream`

Makes a request and returns a `ReadableStream` for streaming large responses.

```typescript
async stream(path: string, options?: Record<string, any>): Promise<ReadableStream>
```

**Example:**
```typescript
const stream = await api.stream('/large-file');
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log('Received chunk:', value);
}
```

---

### `clearCache`

Clears the cache.

```typescript
clearCache(): void
```

**Example:**
```typescript
api.clearCache();
```

---

## Examples

### Example 1: Fetching Data with Retries

```typescript
const api = new SimFetch({
  baseUrl: 'https://api.example.com',
  retry: true,
  retryNumber: 3,
});

try {
  const response = await api.get('/users');
  const users = await response.json();
  console.log(users);
} catch (error) {
  console.error('Request failed:', error);
}
```

### Example 2: Caching Responses

```typescript
const api = new SimFetch({
  baseUrl: 'https://api.example.com',
});

// First request (not cached)
const response1 = await api.get('/posts');
const posts1 = await response1.json();

// Second request (cached)
const response2 = await api.get('/posts');
const posts2 = await response2.json();

console.log(posts1 === posts2); // true
```

### Example 3: Uploading Data

```typescript
const api = new SimFetch({
  baseUrl: 'https://api.example.com',
});

const response = await api.post('/upload', { file: 'data' }, {
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(await response.json());
```

### Example 4: Streaming Large Files

```typescript
const api = new SimFetch({
  baseUrl: 'https://api.example.com',
});

const stream = await api.stream('/large-file');
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log('Received chunk:', value);
}
```

### Example 5: Error Handling

```typescript
const api = new SimFetch({
  baseUrl: 'https://api.example.com',
  retry: true,
  retryNumber: 3,
});

try {
  const response = await api.get('/nonexistent-endpoint');
  const data = await response.json();
} catch (error) {
  if (error.status === 404) {
    console.error('Resource not found');
  } else {
    console.error('Request failed:', error.message);
  }
}
```

---

## License
```markdown
This project is licensed under the MIT License 🔐. See the [LICENSE](LICENSE) file for details.
```
---