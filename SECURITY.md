# BizQuits Security Implementation Guide

## Overview

This document outlines the security measures implemented in the BizQuits application, following modern security best practices and industry standards (OWASP Top 10, NIST guidelines).

## 1. Authentication & Authorization

### JWT Token Security
- **Short-lived access tokens** (15 minutes in production, 60 minutes in development)
- **Refresh tokens** stored in HTTP-only cookies with:
  - `HttpOnly` flag: Prevents JavaScript access (XSS protection)
  - `Secure` flag: Only sent over HTTPS
  - `SameSite=Strict`: Prevents CSRF attacks
  - 7-day expiration with rotation on use
- **Token rotation**: Each refresh invalidates the old token and issues a new one
- **Token reuse detection**: If a revoked token is reused, all user tokens are invalidated (detects potential token theft)
- **Strong signing algorithm**: HS512 (HMAC-SHA512) instead of HS256

### Password Security
- **BCrypt hashing** with work factor 12 (adaptive hashing)
- **Strong password requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- **Timing attack prevention**: Consistent response time for invalid emails

## 2. Rate Limiting

Protection against brute force attacks and DDoS:

| Endpoint Type | Requests | Window |
|---------------|----------|--------|
| Global API    | 100      | 60s    |
| Auth endpoints| 5        | 60s    |

Custom error responses include `retryAfter` information.

## 3. Security Headers

All responses include:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
X-Permitted-Cross-Domain-Policies: none
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Permissions-Policy: accelerometer=(), camera=(), geolocation=(), ...
```

### Content Security Policy (CSP)
Prevents XSS and data injection attacks by controlling allowed content sources.

### HTTP Strict Transport Security (HSTS)
Enabled in production to force HTTPS connections.

## 4. CORS Configuration

- Strict origin whitelist (configured in appsettings)
- Credentials allowed (for HTTP-only cookies)
- Preflight caching (10 minutes)

## 5. Input Validation & Sanitization

### Backend
- All DTOs use data annotations for validation
- Email normalization (lowercase, trimmed)
- Maximum length constraints on all string inputs
- Regular expression validation for sensitive fields (CUI, password)

### Frontend
- Input sanitization before sending to API
- URL parameter encoding
- XSS prevention through React's built-in escaping

## 6. Logging & Monitoring

Using Serilog for structured logging:
- All authentication events logged
- Failed login attempts tracked
- Token operations audited
- Rate limit violations logged
- Security-sensitive operations logged with context

Log files:
- Console output (development)
- Rolling file logs: `logs/bizquits-{date}.log`

## 7. Secret Management

### Development
- Secrets stored in `appsettings.Development.json` (gitignored)
- Can also use .NET User Secrets: `dotnet user-secrets`

### Production
- Use environment variables or a secret management service
- Never commit secrets to source control
- Rotate secrets periodically

### Required Secrets
```bash
# Connection string
ConnectionStrings__DefaultConnection="Server=...;Database=...;..."

# JWT Key (minimum 64 characters for HS512)
Jwt__Key="your-super-secret-key-minimum-64-characters-long-for-hs512-algorithm"
```

## 8. Database Security

- Parameterized queries via Entity Framework (SQL injection prevention)
- Unique indexes on sensitive fields (email)
- Foreign key constraints with appropriate cascade behaviors
- Connection string encryption recommended in production

## 9. API Security

### Error Handling
- Generic error messages to clients (no stack traces)
- Detailed errors logged server-side
- Proper HTTP status codes

### Authorization
- Role-based access control (RBAC)
- `[Authorize]` attributes on all protected endpoints
- Role checks: Admin, Entrepreneur, Client

## 10. Frontend Security

### Token Storage
- Access tokens stored in memory only (not localStorage)
- Refresh tokens in HTTP-only cookies
- Automatic token refresh before expiry

### XSS Prevention
- React's built-in JSX escaping
- Input sanitization utilities
- No `dangerouslySetInnerHTML`

## Security Checklist for Production

- [ ] Use HTTPS everywhere
- [ ] Enable HSTS
- [ ] Set strong JWT secret (64+ characters)
- [ ] Configure production database with strong password
- [ ] Enable database encryption (TDE)
- [ ] Set up monitoring and alerting for security events
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Configure backup and disaster recovery
- [ ] Implement WAF (Web Application Firewall)
- [ ] Set up intrusion detection
- [ ] Review and restrict CORS origins
- [ ] Enable CSP reporting

## API Endpoints Security Matrix

| Endpoint | Auth | Roles | Rate Limit |
|----------|------|-------|------------|
| POST /auth/register | No | - | auth (5/min) |
| POST /auth/login | No | - | auth (5/min) |
| POST /auth/refresh | No | - | auth (5/min) |
| POST /auth/logout | Yes | Any | global |
| GET /user/profile | Yes | Any | global |
| GET /admin/* | Yes | Admin | global |
| GET /service | No | - | global |
| POST /service | Yes | Entrepreneur | global |
| POST /booking | Yes | Client | global |

## Incident Response

If a security incident is detected:

1. **Token reuse detected**: All user tokens are automatically revoked
2. **Multiple failed logins**: Rate limiting kicks in
3. **Suspicious activity**: Check logs in `logs/` directory

## Updating Dependencies

Regularly update dependencies for security patches:

```bash
# Backend
dotnet list package --outdated
dotnet add package <package> --version <version>

# Frontend
npm audit
npm update
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [.NET Security Best Practices](https://docs.microsoft.com/en-us/aspnet/core/security/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
