# IIS Client IP Integration Documentation

## Overview

This document describes the enhanced axios interceptor system that prioritizes IIS-provided client IP information over browser-based IP detection. The system intelligently extracts real client IP addresses from IIS response headers and uses them in subsequent API requests.

## Architecture

```
[Client Browser] → [IIS Server] → [.NET Core API] → [Database]
                      ↓
            [Real Client IP Detection]
                      ↓
            [Headers: X-Forwarded-For, etc.]
                      ↓
            [Frontend: extractServerInfo()]
                      ↓
            [Cached for Future Requests]
```

## Core Functions

### `extractServerInfo(response: AxiosResponse)`

**Purpose**: Extracts server information and client IP from IIS response headers.

**Parameters**:
- `response`: Axios response object containing headers from IIS

**Returns**:
```typescript
{
  serverIP?: string;     // IIS server IP address
  serverName?: string;   // IIS server name (e.g., "Microsoft-IIS/10.0")
  iisVersion?: string;   // IIS and ASP.NET version info
  clientIP?: string;     // Real client IP as detected by IIS
}
```

**Headers Processed**:

| Header Name | Purpose | Example Value |
|-------------|---------|---------------|
| `server` | IIS server identification | `Microsoft-IIS/10.0` |
| `x-server-ip` | IIS server IP address | `192.168.1.100` |
| `x-aspnet-version` | ASP.NET runtime version | `4.0.30319` |
| `x-forwarded-for` | Client IP chain (priority #1) | `203.0.113.45, 10.0.0.1` |
| `x-real-ip` | Real client IP (priority #2) | `203.0.113.45` |
| `x-client-ip` | Custom client IP (priority #3) | `203.0.113.45` |
| `cf-connecting-ip` | Cloudflare client IP (priority #4) | `203.0.113.45` |
| `x-original-forwarded-for` | Original forwarded IP (priority #5) | `203.0.113.45` |
| `x-remote-addr` | Remote address (priority #6) | `203.0.113.45` |

### `getClientIPFromIIS()`

**Purpose**: Retrieves cached IIS-provided client IP from memory or sessionStorage.

**Returns**: `string | null`
- Real client IP if available from IIS
- `null` if no IIS IP has been detected yet

### `getCurrentClientIP()`

**Purpose**: Get the best available client IP (prefers IIS, falls back to browser detection).

**Returns**: `string`
- IIS-provided client IP (if available)
- Browser-detected IP (fallback)

### `getIISClientIP()`

**Purpose**: Get specifically the IIS-provided client IP.

**Returns**: `string | null`
- IIS-provided client IP only
- `null` if not available

## Request Flow

### 1. Initial Request (No IIS IP Cached)

```typescript
// Request Headers Sent:
{
  "X-Client-IP": "browser-aGVsbG93b3Js",  // Browser-detected fallback
  "X-Request-Server-Info": "true",        // Request server info
  "X-Request-Client-IP": "true"           // Request client IP in response
}
```

### 2. Response Processing

```typescript
// IIS Response Headers:
{
  "server": "Microsoft-IIS/10.0",
  "x-forwarded-for": "203.0.113.45, 10.0.0.1",
  "x-aspnet-version": "4.0.30319"
}

// Extracted Server Info:
{
  serverIP: undefined,
  serverName: "Microsoft-IIS/10.0",
  iisVersion: "Microsoft-IIS/10.0 ASP.NET 4.0.30319",
  clientIP: "203.0.113.45"  // ← Real client IP detected!
}
```

### 3. Subsequent Requests (IIS IP Cached)

```typescript
// Request Headers Sent:
{
  "X-Client-IP": "203.0.113.45",  // ← Now using real IIS-provided IP
  "X-Request-Server-Info": "true",
  "X-Request-Client-IP": "true"
}
```

## Data Storage

### SessionStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `iisClientIP` | `"203.0.113.45"` | Cached real client IP from IIS |
| `serverInfo` | JSON object | Complete server information |

### Memory Caches

| Variable | Type | Purpose |
|----------|------|---------|
| `iisClientIPCache` | `string \| null` | In-memory cache of IIS client IP |
| `clientIPCache` | `string \| null` | Browser-detected IP cache |

## Error Handling

### Graceful Fallbacks

1. **No IIS Headers**: Falls back to browser IP detection
2. **Invalid IP Format**: Handles malformed IP addresses gracefully
3. **SessionStorage Failure**: Continues with in-memory cache only
4. **Multiple IPs in Header**: Takes first (original) IP from comma-separated list

### Console Logging

```typescript
// Success cases:
console.log('Client IP detected from IIS headers: 203.0.113.45');
console.log('Using IIS-provided client IP: 203.0.113.45');

// Fallback cases:
console.log('Using browser-detected client IP (IIS IP not available): browser-xyz');

// Error cases:
console.warn('Failed to store IIS client IP in session storage:', error);
console.warn('Failed to retrieve IIS client IP from session storage:', error);
```

## Usage Examples

### Basic Usage

```typescript
import { getCurrentClientIP, getIISClientIP, getServerInfo } from './helper/axiosInterceptor';

// Get best available client IP
const clientIP = getCurrentClientIP();
console.log('Client IP:', clientIP); // "203.0.113.45"

// Get only IIS-provided IP (may be null)
const iisIP = getIISClientIP();
if (iisIP) {
  console.log('Real client IP from IIS:', iisIP);
} else {
  console.log('IIS IP not yet available');
}

// Get complete server information
const serverInfo = getServerInfo();
if (serverInfo) {
  console.log('Server Details:', {
    Server: serverInfo.serverName,
    Version: serverInfo.iisVersion,
    ServerIP: serverInfo.serverIP,
    ClientIP: serverInfo.clientIP
  });
}
```

### React Component Usage

```typescript
import React, { useEffect, useState } from 'react';
import { getServerInfo, getCurrentClientIP } from '../helper/axiosInterceptor';

const ServerInfoComponent: React.FC = () => {
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [clientIP, setClientIP] = useState<string>('');

  useEffect(() => {
    // Get initial client IP
    setClientIP(getCurrentClientIP());

    // Listen for server info updates
    const interval = setInterval(() => {
      const info = getServerInfo();
      if (info && info.clientIP !== serverInfo?.clientIP) {
        setServerInfo(info);
        setClientIP(info.clientIP || getCurrentClientIP());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [serverInfo]);

  return (
    <div>
      <h3>Connection Info</h3>
      <p>Client IP: {clientIP}</p>
      {serverInfo && (
        <>
          <p>Server: {serverInfo.serverName}</p>
          <p>Version: {serverInfo.iisVersion}</p>
          <p>Server IP: {serverInfo.serverIP}</p>
        </>
      )}
    </div>
  );
};
```

## Configuration

### Environment Variables

The system respects existing environment variables:

```env
REACT_APP_API_URL=https://your-api-url.com
REACT_APP_IS_ADFS_ENABLED=1
```

### Request Headers Configuration

The system automatically adds these headers to API requests:

```typescript
config.headers["X-Client-IP"] = clientIP;                    // Real client IP
config.headers["X-Request-Server-Info"] = "true";           // Request server info
config.headers["X-Request-Client-IP"] = "true";             // Request client IP
```

## Benefits

### 1. **Accurate Client Identification**
- Uses real client IP from IIS instead of browser-detected proxies
- Handles complex network topologies with multiple proxies

### 2. **Security Enhancement**
- Provides authentic client IP for audit logs
- Enables proper geolocation and security checks

### 3. **Performance Optimization**
- Caches IIS-provided IP to avoid repeated browser detection
- Reduces unnecessary WebRTC operations

### 4. **Reliability**
- Graceful fallback to browser detection when IIS headers unavailable
- Handles various IIS configuration scenarios

## Troubleshooting

### Common Issues

1. **IIS Headers Not Present**
   - **Cause**: IIS not configured to forward client IP
   - **Solution**: Configure IIS to include `X-Forwarded-For` headers
   - **Fallback**: System automatically uses browser detection

2. **Client IP Shows Internal Address**
   - **Cause**: Getting proxy/load balancer IP instead of client IP
   - **Solution**: Check IIS configuration and header priority order

3. **SessionStorage Errors**
   - **Cause**: Browser restrictions or incognito mode
   - **Solution**: System continues with in-memory cache only

### Debug Information

Enable debug logging by checking authentication requests:

```typescript
// Debug logging is automatically enabled for authentication requests
if (config.url?.includes('/Account/Authenticate')) {
  console.log('Authentication request - Client IP:', clientIP);
  console.log('Request headers:', config.headers);
}
```

## Security Considerations

### 1. **Header Validation**
- System validates IP format before caching
- Handles malicious header injection gracefully

### 2. **Data Privacy**
- Client IP is stored only in sessionStorage (cleared on browser close)
- No permanent storage of IP addresses

### 3. **Fallback Security**
- Always provides some form of client identification
- Prevents null/undefined IP scenarios

## Future Enhancements

### Potential Improvements

1. **IP Geolocation Integration**
2. **Advanced Header Validation**
3. **Custom Header Configuration**
4. **Real-time IP Change Detection**
5. **Enhanced Error Reporting**

---

*Last Updated: November 25, 2025*
*Version: 1.0*