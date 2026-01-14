import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ThemeToggleComponent } from '@shared';

/**
 * Navigation item interface for sidebar menu.
 */
interface NavItem {
  label: string;
  route: string;
  icon: string;
}

/**
 * MainLayoutComponent
 *
 * Primary layout component for authenticated pages.
 * Features a responsive sidenav, toolbar, and main content area.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    ThemeToggleComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  /**
   * Whether the sidenav is open (on mobile).
   */
  public readonly sidenavOpened = signal(false);

  /**
   * Whether the current viewport is mobile-sized.
   */
  public readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map(result => result.matches)),
    { initialValue: false }
  );

  /**
   * Navigation items for the sidebar.
   */
  public readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Staffing', route: '/staffing', icon: 'people' },
    { label: 'Reports', route: '/reports', icon: 'bar_chart' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ];

  /**
   * Toggle the sidenav on mobile.
   */
  public toggleSidenav(): void {
    this.sidenavOpened.update(opened => !opened);
  }

  /**
   * Close the sidenav when navigating on mobile.
   */
  public onNavItemClick(): void {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }
}
