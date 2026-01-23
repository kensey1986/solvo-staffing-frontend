# Solvo Platform Frontend - Architecture Documentation

## Overview

This document defines the technical architecture for the Solvo Platform Frontend application, built with Angular 21 using modern patterns and best practices.

## Repository

- **URL**: `https://devops.softgic.co/DevOps_SE/OP.Solvo.CelulaIA2/_git/solvo_platform_front`

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Angular 21 (LTS) |
| Components | Standalone Components |
| State Management | Signals |
| UI Library | Angular Material (M3) |
| Styling | SCSS Modules |
| Linting | ESLint + Angular ESLint |
| Formatting | Prettier |
| Git Hooks | Husky + lint-staged |
| Testing | Jest |

---

## Brand Identity

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#F09F54` | Sandy Orange - Main actions, headers |
| Secondary | `#74E1F5` | Malibu Blue - Accents, highlights |
| Warn | `#B00020` | Error states, destructive actions |

### Typography

- **Font Family**: Roboto (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold)

---

## Project Structure

```
solvo-staffing-frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── services/
│   │   │   └── core.module.ts
│   │   │
│   │   ├── shared/                  # Reusable components, directives, pipes
│   │   │   ├── components/
│   │   │   │   ├── custom-button/
│   │   │   │   ├── custom-card/
│   │   │   │   └── ...
│   │   │   ├── directives/
│   │   │   ├── pipes/
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── features/                # Feature modules (lazy-loaded)
│   │   │   ├── dashboard/
│   │   │   │   ├── components/      # Smart containers
│   │   │   │   ├── pages/           # Route components
│   │   │   │   └── dashboard.routes.ts
│   │   │   ├── staffing/
│   │   │   └── ...
│   │   │
│   │   ├── layouts/                 # Layout components
│   │   │   ├── main-layout/
│   │   │   ├── auth-layout/
│   │   │   └── layouts.module.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── styles/                      # Global styles
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _theme.scss
│   │   └── styles.scss
│   │
│   ├── assets/
│   │   └── env.json              # Generated environment config
│   └── index.html
│
├── docs/                            # Documentation
├── scripts/
│   └── generate-env.js             # Generates env.json from env vars
├── .env                             # Local environment variables
├── .eslintrc.json
├── .prettierrc
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Design Patterns

### Container/Presentational (Smart vs Dumb Components)

#### Smart Components (Containers)
- Located in `features/*/components/`
- Handle business logic and state
- Inject services
- Pass data to presentational components via `input()` signals
- React to events via `output()` signals

```typescript
// Example: Smart Component
@Component({
  selector: 'app-user-list-container',
  standalone: true,
  template: `
    <app-user-list
      [users]="users()"
      [loading]="loading()"
      (userSelected)="onUserSelected($event)"
    />
  `
})
export class UserListContainerComponent {
  private userService = inject(UserService);
  
  users = this.userService.users;
  loading = this.userService.loading;
  
  onUserSelected(user: User): void {
    this.userService.selectUser(user);
  }
}
```

#### Dumb Components (Presentational)
- Located in `shared/components/`
- Purely presentational
- No service injection
- Use `input()` and `output()` signals
- Highly reusable

```typescript
// Example: Dumb Component
@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    @if (loading()) {
      <mat-spinner />
    } @else {
      @for (user of users(); track user.id) {
        <app-user-card 
          [user]="user" 
          (click)="userSelected.emit(user)" 
        />
      }
    }
  `
})
export class UserListComponent {
  users = input.required<User[]>();
  loading = input<boolean>(false);
  userSelected = output<User>();
}
```

---

## State Management with Signals

### Service-based State

```typescript
@Injectable({ providedIn: 'root' })
export class UserStateService {
  // Private writable signal
  private _users = signal<User[]>([]);
  private _selectedUser = signal<User | null>(null);
  private _loading = signal(false);
  
  // Public read-only signals
  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  
  // Computed signals
  readonly activeUsers = computed(() => 
    this._users().filter(u => u.isActive)
  );
  
  // Actions
  async loadUsers(): Promise<void> {
    this._loading.set(true);
    try {
      const users = await this.http.get<User[]>('/api/users').toPromise();
      this._users.set(users ?? []);
    } finally {
      this._loading.set(false);
    }
  }
  
  selectUser(user: User): void {
    this._selectedUser.set(user);
  }
}
```

---

## Routing and Lazy Loading

### Main Routes (app.routes.ts)

```typescript
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'staffing',
        loadChildren: () => import('./features/staffing/staffing.routes')
          .then(m => m.STAFFING_ROUTES)
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component')
      .then(m => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes')
          .then(m => m.AUTH_ROUTES)
      }
    ]
  }
];
```

---

## Testing Strategy

### Unit Tests (Jest)

- Test presentational components in isolation
- Mock services for container components
- Test state services thoroughly

### Example Test

```typescript
describe('CustomButtonComponent', () => {
  let component: CustomButtonComponent;
  let fixture: ComponentFixture<CustomButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit click event when not disabled', () => {
    const spy = jest.spyOn(component.buttonClick, 'emit');
    
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit click event when disabled', () => {
    const spy = jest.spyOn(component.buttonClick, 'emit');
    
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    
    expect(spy).not.toHaveBeenCalled();
  });
});
```

---

## Material 3 Theming

See `src/styles/_theme.scss` for complete theme configuration.

### Key Points

1. Use `mat.define-theme()` for M3 theming
2. Define custom color palettes based on brand colors
3. Apply theme using CSS variables
4. Support light/dark mode switching

---

## Code Quality Standards

### ESLint Rules

- Angular best practices
- Accessibility (a11y) rules
- Import ordering
- No unused variables

### Prettier Configuration

- Single quotes
- No semicolons (optional)
- 2-space indentation
- 100 character line width

### Git Hooks (Husky)

- Pre-commit: lint-staged (ESLint + Prettier)
- Pre-push: Run tests

---

## Core Module Architecture

The `core/` module contains singleton services, providers, interfaces, models, and DTOs that form the foundation of the application.

### Directory Structure

```
src/app/core/
├── config/                  # Environment configuration
│   ├── env.config.ts        # ENV, API_ENDPOINTS, buildUrl()
│   ├── runtime-env.service.ts  # Loads env.json at runtime
│   └── index.ts
├── dtos/                    # Data Transfer Objects
│   ├── vacancy.dto.ts       # CreateVacancyDto, UpdateVacancyDto, etc.
│   └── index.ts
├── interfaces/              # Service contracts
│   ├── vacancy-service.interface.ts  # IVacancyService
│   └── index.ts
├── models/                  # Domain models
│   ├── vacancy.model.ts     # Vacancy, VacancyStatus, PipelineStage
│   ├── pagination.model.ts  # PaginatedResponse, PaginationParams
│   └── index.ts
├── providers/               # Factory providers
│   ├── vacancy-service.provider.ts  # VACANCY_SERVICE token
│   └── index.ts
├── services/                # Service implementations
│   ├── theme.service.ts
│   └── vacancy/
│       ├── vacancy-api.service.ts   # Real API implementation
│       ├── vacancy-mock.service.ts  # Mock implementation
│       └── index.ts
└── index.ts                 # Public API exports
```

### Service Provider Pattern

The application uses a **factory provider pattern** to switch between mock and real API services based on the `USE_MOCK_SERVICES` environment variable.

#### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENV.useMockServices                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  vacancyServiceFactory()                         │
│  ┌───────────────────┐       ┌───────────────────┐              │
│  │ useMockServices   │  YES  │ VacancyMockService │              │
│  │    === true       │──────►│   (static data)    │              │
│  └───────────────────┘       └───────────────────┘              │
│           │ NO                                                   │
│           ▼                                                      │
│  ┌───────────────────┐                                          │
│  │ VacancyApiService │                                          │
│  │   (HttpClient)    │                                          │
│  └───────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              VACANCY_SERVICE (InjectionToken)                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Interface Definition

```typescript
// src/app/core/interfaces/vacancy-service.interface.ts
export interface IVacancyService {
  getAll(params?: VacancyFilterParams): Observable<PaginatedResponse<Vacancy>>;
  getById(id: number): Observable<Vacancy>;
  create(data: CreateVacancyDto): Observable<Vacancy>;
  update(id: number, data: UpdateVacancyDto): Observable<Vacancy>;
  delete(id: number): Observable<void>;
  changeState(id: number, data: ChangeVacancyStateDto): Observable<Vacancy>;
  getStateHistory(id: number): Observable<VacancyStateChange[]>;
}
```

#### Provider Configuration

```typescript
// src/app/core/providers/vacancy-service.provider.ts
export const VACANCY_SERVICE = new InjectionToken<IVacancyService>('VacancyService');

export function vacancyServiceFactory(injector: EnvironmentInjector): IVacancyService {
  if (ENV.useMockServices) {
    return new VacancyMockService();
  }
  return runInInjectionContext(injector, () => new VacancyApiService());
}

export const VACANCY_SERVICE_PROVIDER: Provider = {
  provide: VACANCY_SERVICE,
  useFactory: vacancyServiceFactory,
  deps: [EnvironmentInjector],
};
```

#### Usage in Components

```typescript
import { VACANCY_SERVICE } from '@core';

@Component({...})
export class VacancyListComponent {
  private readonly vacancyService = inject(VACANCY_SERVICE);

  vacancies = signal<Vacancy[]>([]);

  loadVacancies(): void {
    this.vacancyService.getAll({ page: 1, pageSize: 50 })
      .subscribe(response => this.vacancies.set(response.data));
  }
}
```

### Adding New Services

To add a new service following this pattern:

1. **Define the interface** in `core/interfaces/`
2. **Create models** in `core/models/`
3. **Create DTOs** in `core/dtos/`
4. **Implement mock service** in `core/services/{feature}/{feature}-mock.service.ts`
5. **Implement API service** in `core/services/{feature}/{feature}-api.service.ts`
6. **Create provider** in `core/providers/{feature}-service.provider.ts`
7. **Export from index.ts** files
8. **Register provider** in `app.config.ts`

### Models and DTOs

#### Models (Domain Entities)

```typescript
// vacancy.model.ts
export type VacancyStatus = 'active' | 'filled' | 'expired';
export type PipelineStage = 'detected' | 'contacted' | 'proposal' | 'won' | 'lost';

export interface Vacancy {
  id: number;
  jobTitle: string;
  companyId: number;
  companyName: string;
  location: string;
  status: VacancyStatus;
  pipelineStage: PipelineStage;
  // ... more fields
}
```

#### DTOs (API Contracts)

```typescript
// vacancy.dto.ts
export interface CreateVacancyDto {
  jobTitle: string;
  companyId: number;
  location?: string;
}

export interface VacancyFilterParams extends PaginationParams {
  search?: string;
  status?: VacancyStatus;
  pipelineStage?: PipelineStage;
}
```

#### Pagination

```typescript
// pagination.model.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

---

## Environment Configuration

### Overview

Environment variables are managed through a **runtime configuration** approach that supports:
- Local development with `.env` file
- CI/CD pipelines injecting variables from Azure Key Vault
- No code changes required between environments

### Flow

```
.env (local) ──────────┐
                       ├──► generate-env.js ──► public/assets/env.json ──► APP_INITIALIZER ──► ENV
Pipeline env vars ─────┘
```

### Configuration Files

| File | Purpose |
|------|--------|
| `.env` | Local development variables |
| `scripts/generate-env.js` | Generates `env.json` from environment variables |
| `public/assets/env.json` | Runtime config loaded by Angular (gitignored) |
| `src/app/core/config/env.config.ts` | TypeScript config with fallback defaults |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|--------|
| `API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |
| `API_VERSION` | API version | `v1` |
| `USE_MOCK_SERVICES` | Use mock services instead of real API | `true` |
| `PRODUCTION` | Production mode flag | `false` |
| `API_ENDPOINT_VACANCIES` | Vacancies list endpoint | `/vacancies` |
| `API_ENDPOINT_VACANCY_DETAIL` | Vacancy detail endpoint | `/vacancies/:id` |
| `API_ENDPOINT_VACANCY_STATE` | Vacancy state endpoint | `/vacancies/:id/state` |
| `API_ENDPOINT_VACANCY_HISTORY` | Vacancy history endpoint | `/vacancies/:id/history` |

### Usage in Code

```typescript
import { ENV, API_ENDPOINTS, buildUrl } from '@core/config';

// Access configuration
const apiUrl = ENV.apiUrl; // http://localhost:3000/api/v1
const useMock = ENV.useMockServices;

// Build endpoint URLs
const vacancyUrl = buildUrl(API_ENDPOINTS.vacancies.detail, { id: 123 });
// Result: /vacancies/123
```

### Local Development

1. Copy `.env.example` to `.env` (if exists) or create `.env`
2. Run `npm start` (automatically generates `env.json`)

### CI/CD Pipeline (Azure DevOps)

```yaml
variables:
  API_BASE_URL: $(KeyVault-ApiBaseUrl)
  API_VERSION: 'v1'
  USE_MOCK_SERVICES: 'false'
  PRODUCTION: 'true'

steps:
  - script: npm ci
  - script: npm run build:prod
```

The `generate-env` script reads environment variables injected by the pipeline (from Key Vault or variable groups) and generates `env.json` before the Angular build.

---

## Performance Considerations

1. **Lazy Loading**: All feature modules are lazy-loaded
2. **OnPush Change Detection**: Use with Signals for optimal performance
3. **TrackBy**: Always use track in @for loops
4. **Bundle Analysis**: Regular bundle size monitoring

---

## Accessibility

- All interactive elements have proper ARIA labels
- Color contrast meets WCAG 2.1 AA standards
- Keyboard navigation support
- Screen reader compatibility

