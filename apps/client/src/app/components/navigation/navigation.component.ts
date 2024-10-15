import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DrawerComponent, DrawerContainerComponent } from '../drawer';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TranslocoDirective } from '@jsverse/transloco';

const angularImports = [RouterOutlet, RouterLink, RouterLinkActive];
const taigaUiImports = [TuiButton, TuiIcon];
const thirdPartyImports = [TranslocoDirective];

@Component({
	selector: 'app-navigation',
	standalone: true,
	imports: [DrawerContainerComponent, DrawerComponent, ...angularImports, ...taigaUiImports, ...thirdPartyImports],
	templateUrl: './navigation.component.html',
	styles: `
    :host {
      @apply flex flex-col h-full;
    }
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
	private readonly router = inject(Router);

	public readonly isDrawerOpen = signal<boolean>(false);
	public readonly routes = signal(this.router.config[0].children?.filter((route) => route.path !== ''));
}
