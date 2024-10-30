import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiCheckbox } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-confirm-delete',
	standalone: true,
	imports: [FormsModule, TuiButton, TuiCheckbox, TranslocoDirective],
	template: `
		<ng-container *transloco="let transloco">
			<span class="text-xl font-bold">{{ transloco('dialogs.confirmDelete') }}</span>

			<label class="flex items-center space-x-2 w-1/2">
				<input tuiCheckbox type="checkbox" [(ngModel)]="neverAskAgain" />
				<span>{{ transloco('dialogs.neverAskAgain') }}</span>
			</label>
			<div class="flex space-x-2">
				<button
					class="w-1/2"
					tuiButton
					appearance="primary-destructive"
					type="button"
					size="m"
					(click)="context.completeWith({ delete: true, neverAskAgain: neverAskAgain() })">
					{{ transloco('general.yes') }}
				</button>
				<button
					class="w-1/2"
					tuiButton
					appearance="outline"
					type="button"
					size="m"
					(click)="context.completeWith({ delete: false, neverAskAgain: false })">
					{{ transloco('general.no') }}
				</button>
			</div>
		</ng-container>
	`,
	styles: `
    :host {
		@apply flex flex-col space-y-8 text-center;
    }
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeleteComponent {
	public readonly context = inject<TuiDialogContext<{ delete: boolean; neverAskAgain: boolean }, unknown>>(POLYMORPHEUS_CONTEXT);

	public readonly neverAskAgain = signal<boolean>(false);
}
