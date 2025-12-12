# IIS Client IP - API Reference

## Function Signatures

### `extractServerInfo(response: AxiosResponse)`

Extracts server and client information from IIS response headers.

**Parameters:**
- `response: AxiosResponse` - Axios response object with headers

**Returns:**
```typescript
{
  serverIP?: string;     // IIS server IP address
  serverName?: string;   // IIS server name/version
  iisVersion?: string;   // Combined IIS + ASP.NET version
  clientIP?: string;     // Real client IP detected by IIS
}
```

**Implementation Details:**
- Processes multiple client IP header formats
- Handles comma-separated IP lists (takes first IP)
- Caches detected client IP automatically
- Updates sessionStorage for persistence

**Example:**
```typescript
const serverInfo = extractServerInfo(axiosResponse);
// Returns: { serverName: "Microsoft-IIS/10.0", clientIP: "203.0.113.45" }
```

---

### `getClientIPFromIIS(): string | null`

Retrieves cached IIS-provided client IP.

**Parameters:** None

**Returns:**
- `string` - Cached IIS client IP
- `null` - No IIS IP available yet

**Caching Strategy:**
1. Check in-memory cache (`iisClientIPCache`)
2. Check sessionStorage (`iisClientIP`)
3. Return `null` if not found

**Example:**
```typescript
const iisIP = getClientIPFromIIS();
if (iisIP) {
  console.log('Real client IP:', iisIP);
} else {
  console.log('IIS IP not detected yet');
}
```

---

### `getCurrentClientIP(): string`

Gets the best available client IP address.

**Parameters:** None

**Returns:** `string` - Always returns a client IP (never null)

**Priority Order:**
1. IIS-provided client IP (if available)
2. Browser-detected IP (fallback)

**Example:**
```typescript
const clientIP = getCurrentClientIP();
// Always returns a string: "203.0.113.45" or "browser-xyz"
```

---

### `getIISClientIP(): string | null`

Gets specifically the IIS-provided client IP (wrapper for `getClientIPFromIIS`).

**Parameters:** None

**Returns:**
- `string` - IIS-detected client IP
- `null` - IIS IP not available

**Use Case:** When you need to distinguish between IIS and browser-detected IPs.

**Example:**
```typescript
const iisIP = getIISClientIP();
const browserIP = getClientIP();

console.log('IIS IP:', iisIP || 'Not available');
console.log('Browser IP:', browserIP);
```

---

### `getServerInfo(): object | null`

Retrieves complete server information from sessionStorage.

**Parameters:** None

**Returns:**
```typescript
{
  serverIP?: string;
  serverName?: string;
  iisVersion?: string;
  clientIP?: string;
} | null
```

**Error Handling:**
- Returns `null` if sessionStorage is unavailable
- Returns `null` if no server info has been cached
- Logs errors to console without throwing

**Example:**
```typescript
const serverInfo = getServerInfo();
if (serverInfo) {
  console.log('Server:', serverInfo.serverName);
  console.log('Client IP:', serverInfo.clientIP);
}
```

---

## Internal Functions

### `getClientIP(): string`

Browser-based IP detection (fallback method).

**Methods Used:**
1. Navigator connection info
2. WebRTC IP detection
3. Browser fingerprinting
4. Timestamp-based identifier

**Always Returns:** A string identifier (never fails)

---

## Data Structures

### ServerInfo Interface

```typescript
interface ServerInfo {
  serverIP?: string;        // "192.168.1.100"
  serverName?: string;      // "Microsoft-IIS/10.0"
  iisVersion?: string;      // "Microsoft-IIS/10.0 ASP.NET 4.0.30319"
  clientIP?: string;        // "203.0.113.45"
}
```

### Request Headers Added

```typescript
interface RequestHeaders {
  "X-Client-IP": string;                 // Client IP address
  "X-Request-Server-Info": "true";       // Request server info
  "X-Request-Client-IP": "true";         // Request client IP
  "Content-Type": "application/json";
  "Accept": "application/json";
  "Authorization": string;               // JWT token
  "Username": string;                    // User identifier
  "Consumer": "FMS";                     // Application identifier
  "Language": "en" | "ar";               // UI language
}
```

---

## Storage Schema

### SessionStorage Keys

```typescript
interface SessionStorageSchema {
  iisClientIP: string;      // "203.0.113.45"
  serverInfo: string;       // JSON.stringify(ServerInfo)
}
```

### Memory Variables

```typescript
let iisClientIPCache: string | null = null;  // IIS IP cache
let clientIPCache: string | null = null;     // Browser IP cache
```

---

## Error Codes & Handling

### Console Messages

| Level | Message | Meaning |
|-------|---------|---------|
| `log` | `"Client IP detected from IIS headers: X"` | Success: IIS IP found |
| `log` | `"Using IIS-provided client IP: X"` | Success: Using cached IIS IP |
| `log` | `"Using browser-detected client IP (IIS IP not available): X"` | Fallback: Using browser IP |
| `warn` | `"Failed to store IIS client IP in session storage"` | Warning: Storage issue |
| `warn` | `"Failed to retrieve IIS client IP from session storage"` | Warning: Retrieval issue |
| `error` | `"Error retrieving server info"` | Error: getServerInfo failed |

### Error Recovery

All functions implement graceful error recovery:
- Storage failures → Continue with memory cache
- Missing headers → Use fallback methods
- Invalid data → Return null/default values

---

## Performance Characteristics

### Caching Strategy

- **Memory Cache**: O(1) access time
- **SessionStorage**: O(1) access with try/catch overhead
- **Browser Detection**: O(n) where n = detection methods

### Network Impact

- **Additional Headers**: ~150 bytes per request
- **Response Processing**: Minimal overhead
- **Storage Operations**: Async, non-blocking

---

## Browser Compatibility

### Supported Browsers

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (limited WebRTC)
- **Edge**: Full support
- **IE11**: Partial support (no WebRTC)

### Fallback Mechanisms

- WebRTC not available → Navigator/fingerprint detection
- SessionStorage disabled → Memory cache only
- All detection fails → Timestamp-based identifier

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-25 | Initial IIS client IP integration |

---

*This API reference is automatically generated from source code analysis.*