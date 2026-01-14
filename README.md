# Solvo Staffing Frontend

Angular 18+ enterprise frontend application with Material 3 theming and Clean Architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm start

# Production build
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## Tech Stack

- **Angular 21** - Standalone components, Signals, Control Flow
- **Angular Material** - M3 theming with custom brand colors
- **SCSS** - Modular styling with design tokens
- **Jest** - Unit testing
- **ESLint + Prettier** - Code quality
- **Husky** - Git hooks

## Project Structure

```
src/app/
├── core/          # Singleton services, guards, interceptors
├── shared/        # Reusable components, directives, pipes
├── features/      # Feature modules (lazy-loaded)
├── layouts/       # Layout components (main, auth)
└── app.routes.ts  # Root routing
```

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#F09F54` | Sandy Orange |
| Secondary | `#74E1F5` | Malibu Blue |
| Warn | `#B00020` | Error states |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Components](docs/COMPONENTS.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run test:coverage` | Test with coverage |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

## License

Proprietary - Solvo Global
