import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * AppComponent
 *
 * Root component of the Solvo Staffing Frontend application.
 * Uses routing to render different layouts and pages.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
