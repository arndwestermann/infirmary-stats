import { TuiRoot } from '@taiga-ui/core';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiThemeColorService } from '@taiga-ui/cdk';

@Component({
	standalone: true,
	imports: [RouterModule, TuiRoot],
	selector: 'app-root',
	template: `
		<tui-root class="h-full" tuiTheme="light">
			<router-outlet />
		</tui-root>
	`,
	styles: `
		:host {
			@apply block h-full;
		}`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	private readonly theme = inject(TuiThemeColorService);

	public ngOnInit(): void {
		this.theme.color = '#393D47';
	}
}
