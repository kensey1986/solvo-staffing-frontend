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

## Repository

- **URL**: `https://devops.softgic.co/DevOps_SE/OP.Solvo.CelulaIA2/_git/solvo_platform_front`

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

## Environment Configuration

The app uses runtime configuration loaded from `/assets/env.json`.

### Local Development

Edit `.env` file:

```env
API_BASE_URL=http://localhost:3000/api
API_VERSION=v1
USE_MOCK_SERVICES=true
PRODUCTION=false
```

### CI/CD Pipeline

Set environment variables in Azure DevOps (from Key Vault or variable groups):

```yaml
variables:
  API_BASE_URL: $(KeyVault-ApiBaseUrl)
  USE_MOCK_SERVICES: 'false'
  PRODUCTION: 'true'
```

Then run `npm run build:prod`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server (generates env.json) |
| `npm run build` | Production build (generates env.json) |
| `npm run build:dev` | Development build |
| `npm run build:prod` | Production build |
| `npm run generate-env` | Generate env.json from environment variables |
| `npm test` | Run tests |
| `npm run test:coverage` | Test with coverage |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

## License

Proprietary - Solvo Global
