# Changelog

## [Unreleased]

### Added
- German translation (`de`), selectable in the language menu and through `?lang=de`
- "Apply gradient" checkbox in the Effects tab; the gradient is off until it is ticked
- `npm test` (`scripts/check-offline.js`) checks the offline file list of the service worker; it also runs in CI

### Fixed
- Center logo and gradient were never drawn on the QR code. Both are now drawn for every generation path (Web Worker and main thread) and in the SVG export. The gradient supports its end colour and all four directions; the logo keeps its aspect ratio, is centered on the QR and is shrunk on upload
- "Remove" on the center logo did not remove it from later QR codes
- The default gradient colours replaced the foreground colour chosen by the user
- Margin 0 was treated as margin 4, and the QR code was not centered in the PNG
- Offline support: the service worker used root paths (`/sw.js`, `/index.html`), so it did not register on GitHub Pages project sites; the cache list contained a file that does not exist, which made the install fail without a message; files needed at runtime (scanner, language files, worker files, icons) and the PDF/ZIP libraries from the CDN were not cached. The cache version is now `1.0.2`
- PNG export, SVG export and the Download button did nothing in Chrome, because the Content-Security-Policy blocks `fetch()` of `data:` URLs. The QR image is now converted to a file in code
- The integrity hash of the JSZip library was wrong, so the batch "Download All" ZIP could never load
- Form labels, placeholders, dropdown options and validation messages were always Spanish, even in the English view (visible in the WiFi form). They now use translation keys in all four languages (en, es, pt, fr), with English fallbacks in `qr-types.js`
- Form title and share text now use the translated QR type name
- Update/online/offline toasts in `pwa.js` are translated
- Batch QR type dropdown is translated
- Saved language choice is now restored on load; `?lang=` links (used by the hreflang tags) now work
- Changing the language with a form open now re-renders the form and keeps the entered values

## [1.0.1] - 2026-07-11

### Fixed
- PayPal donation URL format (was using email as username)
- SVG export now generates actual QR code matrix, not placeholder text
- XSS vulnerabilities in batch display and toast messages
- Calendar event timezone offset (was shifting UTC)
- Camera scanner not stopping after QR detection
- PDF export race condition (onload after src)
- WiFi QR format (removed trailing double semicolon)
- vCard format (CRLF line endings, special character escaping)
- Batch generation now uses QR_TYPES generators instead of hardcoded switch
- Hardcoded Spanish strings replaced with i18n translation keys

### Added
- MIT LICENSE file
- .gitignore
- .editorconfig
- GitHub Actions CI/CD workflow (lint + deploy)
- CHANGELOG.md, CONTRIBUTING.md, SECURITY.md
- Content-Security-Policy meta tag
- OG social preview image
- PWA icons generated at all required sizes
- New i18n keys for validation, upload, and customization messages

### Changed
- Spanish toast/validation strings migrated to translation system
- utils.js and validation.js converted from broken ES modules to plain scripts
- Service Worker now pre-caches JSZip, jsPDF, icons, and utility scripts
- README fully rewritten with badges, QR type table, and project structure
- Footer redesigned (professional layout, GitHub links, no emojis)
- Canonical URLs updated to GitHub Pages domain
- ESLint config updated with correct global variables

### Removed
- Development test files (`test-*.html`)
- BATCH_QR_FIX_SUMMARY.md
- Donation section from footer
- Dead `setupDonationButtons()` method

## [1.0.0] - 2025-11-28

- Initial release
- 15 QR types supported
- PWA with offline support
- 4 languages (EN, ES, PT, FR)
- Batch QR generation
- QR scanner
- Dark/light theme
- Export to PNG, SVG, PDF
