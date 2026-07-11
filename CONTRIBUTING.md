# Contributing

Thanks for your interest in contributing to QR Generator Offline!

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `npm run lint` to check for errors
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Guidelines

- Maintain the existing code style (ESLint will guide you)
- Keep the PWA fully offline — no external API calls at runtime
- Add i18n translation keys to all 4 language files for any new UI text
- Test your changes by running `npx serve public` locally
- Do not introduce server-side dependencies
