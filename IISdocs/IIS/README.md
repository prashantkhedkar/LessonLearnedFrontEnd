# Documentation - IIS Client IP Integration

This directory contains comprehensive documentation for the IIS client IP integration system in the axios interceptor.

## Documents

### 📘 [IIS Client IP Documentation](./IIS-ClientIP-Documentation.md)
**Complete technical documentation**
- Architecture overview
- Detailed function descriptions
- Request/response flow
- Error handling and troubleshooting
- Usage examples and best practices

### 🚀 [Quick Reference Guide](./IIS-ClientIP-QuickReference.md)  
**Developer quick start guide**
- Function summary table
- Common usage patterns
- Key configuration options
- Console output examples

### 🔧 [API Reference](./IIS-ClientIP-API-Reference.md)
**Technical API documentation**
- Function signatures and parameters
- Return types and interfaces
- Error codes and handling
- Performance characteristics
- Browser compatibility

## What This System Does

The IIS Client IP integration enhances the axios interceptor to:

1. **Extract Real Client IPs**: Gets authentic client IP addresses from IIS headers instead of browser detection
2. **Intelligent Fallback**: Gracefully falls back to browser detection when IIS headers aren't available  
3. **Automatic Caching**: Caches IIS-provided IPs for improved performance
4. **Enhanced Security**: Provides accurate client identification for audit logs and security

## Key Features

- ✅ **Real IP Detection**: Uses `X-Forwarded-For` and other IIS headers
- ✅ **Smart Caching**: Memory + sessionStorage caching strategy
- ✅ **Graceful Fallback**: Browser detection when IIS unavailable
- ✅ **Zero Configuration**: Works automatically with existing axios setup
- ✅ **Error Resilient**: Handles all error scenarios gracefully

## Quick Usage

```typescript
import { getCurrentClientIP, getServerInfo } from './helper/axiosInterceptor';

// Get best available client IP
const clientIP = getCurrentClientIP(); // "203.0.113.45"

// Get complete server information  
const serverInfo = getServerInfo();
// { serverName: "Microsoft-IIS/10.0", clientIP: "203.0.113.45" }
```

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| IIS Header Detection | ✅ Complete | Supports 6 header types |
| Client IP Caching | ✅ Complete | Memory + sessionStorage |
| Browser Fallback | ✅ Complete | 3 detection methods |
| Error Handling | ✅ Complete | All scenarios covered |
| Documentation | ✅ Complete | 3 comprehensive docs |

## Related Files

- **Implementation**: `src/app/helper/axiosInterceptor.ts`
- **Types**: Interfaces defined inline
- **Tests**: TODO - Unit tests needed

## Support

For questions or issues:
1. Check the [Complete Documentation](./IIS-ClientIP-Documentation.md) first
2. Review [API Reference](./IIS-ClientIP-API-Reference.md) for technical details
3. Use [Quick Reference](./IIS-ClientIP-QuickReference.md) for common tasks

---

*Last Updated: November 25, 2025*