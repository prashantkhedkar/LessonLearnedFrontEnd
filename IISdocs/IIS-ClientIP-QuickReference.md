# IIS Client IP - Quick Reference Guide

## Quick Start

```typescript
import { getCurrentClientIP, getIISClientIP, getServerInfo } from './helper/axiosInterceptor';

// Get current client IP (best available)
const clientIP = getCurrentClientIP();

// Get IIS-specific client IP (may be null initially)
const iisIP = getIISClientIP();

// Get complete server info
const serverInfo = getServerInfo();
```

## Key Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `getCurrentClientIP()` | `string` | Best available client IP (IIS preferred, browser fallback) |
| `getIISClientIP()` | `string \| null` | IIS-provided client IP only |
| `getServerInfo()` | `object \| null` | Complete server and client information |

## Response Object Structure

```typescript
interface ServerInfo {
  serverIP?: string;     // IIS server IP
  serverName?: string;   // "Microsoft-IIS/10.0"
  iisVersion?: string;   // "Microsoft-IIS/10.0 ASP.NET 4.0.30319"
  clientIP?: string;     // Real client IP from IIS
}
```

## Headers Added to Requests

```typescript
{
  "X-Client-IP": "203.0.113.45",        // Client IP (IIS preferred)
  "X-Request-Server-Info": "true",      // Request server info
  "X-Request-Client-IP": "true"         // Request client IP
}
```

## IIS Headers Detected

| Priority | Header | Example |
|----------|--------|---------|
| 1 | `x-forwarded-for` | `203.0.113.45, 10.0.0.1` |
| 2 | `x-real-ip` | `203.0.113.45` |
| 3 | `x-client-ip` | `203.0.113.45` |
| 4 | `cf-connecting-ip` | `203.0.113.45` |
| 5 | `x-original-forwarded-for` | `203.0.113.45` |
| 6 | `x-remote-addr` | `203.0.113.45` |

## Console Output Examples

```typescript
// Success
"Client IP detected from IIS headers: 203.0.113.45"
"Using IIS-provided client IP: 203.0.113.45"

// Fallback
"Using browser-detected client IP (IIS IP not available): browser-xyz"
```

## Storage

- **SessionStorage**: `iisClientIP`, `serverInfo`
- **Memory Cache**: `iisClientIPCache`, `clientIPCache`

## Flow

1. **First Request**: Uses browser-detected IP
2. **Response**: Extracts real IP from IIS headers
3. **Cache**: Stores IIS IP in memory + sessionStorage
4. **Subsequent Requests**: Uses cached IIS IP

## Error Handling

- Graceful fallback to browser detection
- Handles malformed headers
- SessionStorage failure tolerance
- Multiple IP parsing (takes first IP)

---

*For detailed documentation, see: [IIS-ClientIP-Documentation.md](./IIS-ClientIP-Documentation.md)*