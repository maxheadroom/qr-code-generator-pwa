# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ |

## Reporting a Vulnerability

This project processes all data entirely client-side. No data is transmitted to any server.

If you discover a security vulnerability, please report it by opening an issue at:

https://github.com/jmarc9901/qr-code-generator-pwa/issues

Please do not disclose the vulnerability publicly until it has been addressed.

## Security Measures

- All input is sanitized before processing
- No data is sent to external servers
- QR generation runs locally in the browser or in a Web Worker
- Content Security Policy headers are enforced
- Third-party libraries are loaded with integrity hashes where possible
- The PWA uses HTTPS for Service Worker registration
