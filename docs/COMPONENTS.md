# Component Documentation

This document provides usage examples and API documentation for the shared components in the Solvo Staffing Frontend project.

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

## Design Tokens

Components use design tokens from `_variables.scss`:

| Token | Value | Usage |
|-------|-------|-------|
| `$primary-color` | `#F09F54` | Primary actions |
| `$secondary-color` | `#74E1F5` | Secondary actions |
| `$warn-color` | `#B00020` | Destructive actions |
