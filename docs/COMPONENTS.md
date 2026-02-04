# Component Documentation

This document provides usage examples and API documentation for the shared components in the Solvo Platform Frontend project.

## Repository

- **URL**: `https://devops.softgic.co/DevOps_SE/OP.Solvo.CelulaIA2/_git/solvo_platform_front`

---

## Table of Contents

- [CustomButtonComponent](#custombuttoncomponent)
- [CustomCardComponent](#customcardcomponent)
- [KpiCardComponent](#kpicardcomponent)
- [PipelineBadgeComponent](#pipelinebadgecomponent)
- [StatusBadgeComponent](#statusbadgecomponent)
- [CompanyPipelineBadgeComponent](#companypipelinebadgecomponent)
- [RelationshipTypeBadgeComponent](#relationshiptypebadgecomponent)
- [TagsInputComponent](#tagsinputcomponent)
- [StateChangeModalComponent](#statechangemodalcomponent)
- [CreateVacancyModalComponent](#createvacancymodalcomponent)
- [EditVacancyModalComponent](#editvacancymodalcomponent)
- [ThemeToggleComponent](#themetogglecomponent)
- [Core Services](#core-services)

---

## CustomButtonComponent

A reusable button component integrating with the Solvo design system.

### Import

```typescript
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
```

### API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | **required** | Button text |
| `variant` | `'primary' \| 'secondary' \| 'warn' \| 'text'` | `'primary'` | Visual style |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading spinner |
| `icon` | `string` | `undefined` | Material icon name |
| `iconPosition` | `'start' \| 'end'` | `'start'` | Icon placement |
| `fullWidth` | `boolean` | `false` | Full width |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |

| Output | Type | Description |
|--------|------|-------------|
| `buttonClick` | `MouseEvent` | Click event |

### Examples

```html
<!-- Primary button -->
<app-custom-button
  label="Submit"
  variant="primary"
  icon="send"
  (buttonClick)="onSubmit()"
/>

<!-- Loading state -->
<app-custom-button
  label="Processing..."
  [loading]="true"
/>

<!-- Full width secondary -->
<app-custom-button
  label="Continue"
  variant="secondary"
  [fullWidth]="true"
/>
```

---

## CustomCardComponent

A reusable card component with multiple elevation and interaction options.

### Import

```typescript
import { CustomCardComponent } from '@shared/components/custom-card/custom-card.component';
```

### API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | `undefined` | Card title |
| `subtitle` | `string` | `undefined` | Card subtitle |
| `icon` | `string` | `undefined` | Header icon |
| `elevation` | `'flat' \| 'raised' \| 'elevated'` | `'raised'` | Shadow level |
| `clickable` | `boolean` | `false` | Interactive card |
| `selected` | `boolean` | `false` | Selected state |
| `padded` | `boolean` | `true` | Content padding |

| Output | Type | Description |
|--------|------|-------------|
| `cardClick` | `MouseEvent` | Click event (if clickable) |

### Content Slots

- Default: Main content
- `[card-header]`: Custom header
- `[card-footer]`: Footer content
- `[card-actions]`: Action buttons

### Examples

```html
<!-- Basic card -->
<app-custom-card
  title="Dashboard"
  subtitle="Overview"
  icon="dashboard"
>
  <p>Card content here...</p>
</app-custom-card>

<!-- Clickable card -->
<app-custom-card
  [clickable]="true"
  (cardClick)="onCardClick()"
>
  <p>Click me!</p>
</app-custom-card>

<!-- With custom actions -->
<app-custom-card title="Actions Example">
  <p>Content</p>
  <div card-actions>
    <app-custom-button label="Cancel" variant="text" />
    <app-custom-button label="Save" variant="primary" />
  </div>
</app-custom-card>
```

---

## KpiCardComponent

A reusable KPI card component for displaying dashboard metrics.

### Import

```typescript
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card.component';
```

### API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | **required** | Title/Label of the KPI |
| `value` | `string \| number` | **required** | Numeric or text value |
| `icon` | `string` | **required** | Material icon name |
| `iconColor` | `'purple' \| 'blue' \| 'green' \| 'orange'` | `'purple'` | Color variant for icon background |

### Examples

```html
<!-- Basic KPI card -->
<app-kpi-card
  label="Total Vacancies"
  value="145"
  icon="work"
  iconColor="blue"
/>

<!-- Multiple KPI cards -->
<div class="kpi-grid">
  <app-kpi-card label="Active" value="89" icon="check_circle" iconColor="green" />
  <app-kpi-card label="Pending" value="32" icon="pending" iconColor="orange" />
  <app-kpi-card label="Filled" value="24" icon="task_alt" iconColor="purple" />
</div>
```

---

## PipelineBadgeComponent

Displays a colored badge representing the vacancy pipeline stage.

### Import

```typescript
import { PipelineBadgeComponent } from '@shared/components/pipeline-badge/pipeline-badge.component';
```

### API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `stage` | `PipelineStage` | **required** | Pipeline stage to display |
| `clickable` | `boolean` | `false` | Whether the badge is clickable |

### Pipeline Stages

| Stage | Color | Description |
|-------|-------|-------------|
| `detected` | Gray | Initial detection |
| `contacted` | Blue | Contact made |
| `proposal` | Yellow | Proposal sent |
| `won` | Green | Successfully won |
| `lost` | Red | Lost opportunity |

### Examples

```html
<app-pipeline-badge [stage]="'detected'" />
<app-pipeline-badge [stage]="'contacted'" />
<app-pipeline-badge [stage]="'proposal'" />
<app-pipeline-badge [stage]="'won'" />
<app-pipeline-badge [stage]="'lost'" />
```

---

## StatusBadgeComponent

Displays a badge representing the vacancy status.

### Import

```typescript
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
```

### API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `VacancyStatus` | **required** | Vacancy status to display |

### Vacancy Statuses

| Status | Description |
|--------|-------------|
| `active` | Currently active vacancy |
| `filled` | Position has been filled |
| `expired` | Vacancy has expired |

### Examples

```html
<app-status-badge [status]="'active'" />
<app-status-badge [status]="'filled'" />
<app-status-badge [status]="'expired'" />
```

---

## CompanyPipelineBadgeComponent

Displays a colored badge representing the company pipeline stage.

### Import

```typescript
import { CompanyPipelineBadgeComponent } from '@shared/components/company-pipeline-badge/company-pipeline-badge.component';
```

### API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `stage` | `CompanyPipelineStage` | **required** | Company pipeline stage to display |

### Company Pipeline Stages

| Stage | Color | Description |
|-------|-------|-------------|
| `lead` | Gray | Initial lead |
| `prospecting` | Blue | In prospecting phase |
| `engaged` | Orange | Engaged in conversation |
| `initial_appointment_held` | Yellow | First meeting held |
| `onboarding_started` | Green | Onboarding in progress |
| `lost` | Red | Lost opportunity |

### Examples

```html
<app-company-pipeline-badge [stage]="'lead'" />
<app-company-pipeline-badge [stage]="'prospecting'" />
<app-company-pipeline-badge [stage]="'engaged'" />
```

---

## RelationshipTypeBadgeComponent

Displays a colored badge representing the company relationship type.

### Import

```typescript
import { RelationshipTypeBadgeComponent } from '@shared/components/relationship-type-badge/relationship-type-badge.component';
```

### API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `CompanyRelationshipType` | **required** | Relationship type to display |

### Relationship Types

| Type | Color | Description |
|------|-------|-------------|
| `client` | Green | Active client |
| `prospect` | Blue | Prospect company |
| `lead` | Orange | Lead stage |
| `inactive` | Gray | Inactive relationship |

### Examples

```html
<app-relationship-type-badge [type]="'client'" />
<app-relationship-type-badge [type]="'prospect'" />
<app-relationship-type-badge [type]="'lead'" />
<app-relationship-type-badge [type]="'inactive'" />
```

---

## TagsInputComponent

Reusable component for entering and displaying tags with add/remove operations.

### Import

```typescript
import { TagsInputComponent } from '@shared/components/tags-input/tags-input.component';
```

### API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `tags` | `string[]` | `[]` | Array of tags to display |
| `placeholder` | `string` | `'Add tag...'` | Input placeholder text |
| `maxTags` | `number` | `0` | Maximum tags allowed (0 = unlimited) |
| `readonly` | `boolean` | `false` | Readonly mode |
| `showCounter` | `boolean` | `false` | Show tags counter |

| Output | Type | Description |
|--------|------|-------------|
| `tagsChange` | `string[]` | Emitted when tags change |

### Examples

```html
<!-- Basic tags input -->
<app-tags-input
  [tags]="['urgent', 'follow-up']"
  placeholder="Add tag..."
  [maxTags]="5"
  (tagsChange)="onTagsChange($event)"
/>

<!-- Readonly display -->
<app-tags-input
  [tags]="vacancy.tags"
  [readonly]="true"
/>

<!-- With counter -->
<app-tags-input
  [tags]="tags"
  [maxTags]="10"
  [showCounter]="true"
  (tagsChange)="tags = $event"
/>
```

---

## ThemeToggleComponent

Toggle button for switching between light and dark themes.

### Import

```typescript
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
```

### Examples

```html
<app-theme-toggle />
```

---

## Core Services

### Vacancy Service

The vacancy service provides CRUD operations for job vacancies with automatic mock/API switching.

#### Import

```typescript
import { VACANCY_SERVICE, IVacancyService } from '@core';
```

#### Injection

```typescript
private readonly vacancyService = inject(VACANCY_SERVICE);
```

#### API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getAll` | `VacancyFilterParams?` | `Observable<PaginatedResponse<Vacancy>>` | List vacancies with filters |
| `getById` | `id: number` | `Observable<Vacancy>` | Get single vacancy |
| `create` | `CreateVacancyDto` | `Observable<Vacancy>` | Create new vacancy |
| `update` | `id, UpdateVacancyDto` | `Observable<Vacancy>` | Update vacancy |
| `delete` | `id: number` | `Observable<void>` | Delete vacancy |
| `changeState` | `id, ChangeVacancyStateDto` | `Observable<Vacancy>` | Change pipeline stage |
| `getStateHistory` | `id: number` | `Observable<VacancyStateChange[]>` | Get state history |

#### Examples

```typescript
// List with filters
this.vacancyService.getAll({
  page: 1,
  pageSize: 50,
  status: 'active',
  pipelineStage: 'contacted'
}).subscribe(response => {
  console.log(response.data);      // Vacancy[]
  console.log(response.total);     // Total count
  console.log(response.totalPages);
});

// Get single vacancy
this.vacancyService.getById(123)
  .subscribe(vacancy => console.log(vacancy));

// Change pipeline state
this.vacancyService.changeState(123, {
  newState: 'proposal',
  note: 'Moving to proposal stage after client meeting',
  tags: ['priority', 'client-meeting']
}).subscribe(updated => console.log(updated));
```

---

### Company Service

The company service provides CRUD operations for companies with CRM capabilities.

#### Import

```typescript
import { COMPANY_SERVICE, ICompanyService } from '@core';
```

#### Injection

```typescript
private readonly companyService = inject(COMPANY_SERVICE);
```

#### API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getAll` | `CompanyFilterParams?` | `Observable<PaginatedResponse<Company>>` | List companies with filters |
| `getById` | `id: number` | `Observable<Company>` | Get single company with contacts |
| `create` | `CreateCompanyDto` | `Observable<Company>` | Create new company |
| `update` | `id, UpdateCompanyDto` | `Observable<Company>` | Update company |
| `delete` | `id: number` | `Observable<void>` | Delete company |
| `changeState` | `id, ChangeCompanyStateDto` | `Observable<Company>` | Change pipeline stage |
| `getStateHistory` | `id: number` | `Observable<CompanyStateChange[]>` | Get state history |
| `getVacancies` | `id: number` | `Observable<Vacancy[]>` | Get company vacancies |
| `updateResearch` | `id, UpdateResearchDto` | `Observable<Research>` | Update research data |
| `investigate` | `InvestigateCompanyDto` | `Observable<Company>` | Trigger prospection engine |
| `createContact` | `companyId, CreateContactDto` | `Observable<Contact>` | Add contact |
| `updateContact` | `companyId, contactId, UpdateContactDto` | `Observable<Contact>` | Update contact |
| `deleteContact` | `companyId, contactId` | `Observable<void>` | Remove contact |

#### Examples

```typescript
// List companies with filters
this.companyService.getAll({
  page: 1,
  pageSize: 50,
  relationshipType: 'client',
  pipelineStage: 'engaged'
}).subscribe(response => console.log(response.data));

// Get company with contacts and research
this.companyService.getById(456)
  .subscribe(company => {
    console.log(company.contacts);
    console.log(company.research);
  });

// Initiate company investigation
this.companyService.investigate({
  domain: 'example.com',
  assignedTo: 'user@company.com'
}).subscribe(company => console.log(company));
```

---

### Dashboard Service

The dashboard service provides KPI data for the main dashboard.

#### Import

```typescript
import { DASHBOARD_SERVICE, IDashboardService } from '@core';
```

#### Injection

```typescript
private readonly dashboardService = inject(DASHBOARD_SERVICE);
```

#### API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getDashboardData` | - | `Observable<DashboardData>` | Get KPI data for dashboards |

#### Dashboard Data Structure

```typescript
interface DashboardData {
  vacancyKpis: KpiItem[];
  companyKpis: KpiItem[];
}

interface KpiItem {
  label: string;
  value: string;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'orange';
}
```

#### Examples

```typescript
this.dashboardService.getDashboardData()
  .subscribe(data => {
    this.vacancyKpis = data.vacancyKpis;
    this.companyKpis = data.companyKpis;
  });
```

---

### Auth Service

The auth service handles authentication with support for traditional login and SSO.

#### Import

```typescript
import { AUTH_SERVICE, IAuthService } from '@core';
```

#### Injection

```typescript
private readonly authService = inject(AUTH_SERVICE);
```

#### API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `login` | `LoginDto` | `Observable<LoginResponseDto>` | Email/password login |
| `logout` | - | `Observable<void>` | Logout and clear session |
| `getCurrentUser` | - | `Observable<User \| null>` | Get current user |
| `isAuthenticated` | - | `boolean` | Check auth status |
| `getAccessToken` | - | `string \| null` | Get access token |
| `restoreSession` | - | `void` | Restore session from storage |
| `initSsoLogin` | `SsoProvider` | `Observable<SsoInitResponseDto>` | Initiate SSO flow |
| `handleSsoCallback` | `code, state` | `Observable<LoginResponseDto>` | Handle SSO callback |

#### Examples

```typescript
// Traditional login
this.authService.login({
  email: 'user@example.com',
  password: 'password123'
}).subscribe(response => {
  console.log(response.user);
  console.log(response.accessToken);
});

// SSO login
this.authService.initSsoLogin('microsoft')
  .subscribe(response => {
    window.location.href = response.authorizationUrl;
  });

// Check authentication
if (this.authService.isAuthenticated()) {
  // User is logged in
}
```

---

### Mock vs API Service Switching

All services automatically switch between implementations based on `ENV.useMockServices`:

| Mode | Service | Description |
|------|---------|-------------|
| `USE_MOCK_SERVICES=true` | `*MockService` | Static data with simulated 300ms delay |
| `USE_MOCK_SERVICES=false` | `*ApiService` | Real HTTP calls to backend API |

---

## Design Tokens

Components use design tokens from `_variables.scss`:

| Token | Value | Usage |
|-------|-------|-------|
| `$primary-color` | `#F09F54` | Primary actions |
| `$secondary-color` | `#74E1F5` | Secondary actions |
| `$warn-color` | `#B00020` | Destructive actions |
