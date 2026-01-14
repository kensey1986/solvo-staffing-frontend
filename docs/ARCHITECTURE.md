# Solvo Staffing Frontend - Architecture Documentation

## Overview

This document defines the technical architecture for the Solvo Staffing Frontend application, built with Angular 18+ using modern patterns and best practices.

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Angular 18+ (LTS) |
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
│   ├── environments/
│   └── index.html
│
├── docs/                            # Documentation
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

