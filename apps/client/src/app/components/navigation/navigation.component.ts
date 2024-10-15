import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DrawerComponent, DrawerContainerComponent } from '../drawer';
import { RouterOutlet } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

const angularImports = [RouterOutlet];
const taigaUiImports = [TuiButton, TuiIcon];

@Component({
	selector: 'app-navigation',
	standalone: true,
	imports: [DrawerContainerComponent, DrawerComponent, ...angularImports, ...taigaUiImports],
	templateUrl: './navigation.component.html',
	styles: `
    :host {
      @apply flex flex-col h-full;
    }
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
	public readonly isDrawerOpen = signal<boolean>(false);
}
