import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { TuiButton, TuiDialogContext, TuiTextfield } from '@taiga-ui/core';

import { TuiSelectModule, TuiTextfieldControllerModule, TuiInputDateTimeModule, TuiComboBoxModule } from '@taiga-ui/legacy';

import { IRecord, SPECIALTIES, Specialty } from 'apps/client/src/app/models';

import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiLet } from '@taiga-ui/cdk';
import { TuiDataListWrapper, TuiFilterByInputPipe, TuiStringifyContentPipe } from '@taiga-ui/kit';
import { IRecordForm } from '../../models/record-form.model';
import { NativeDatetimeTransformerDirective } from 'apps/client/src/app/shared/directives';

const angularImports = [ReactiveFormsModule, NgTemplateOutlet, NgClass];
const firstPartyImports = [NativeDatetimeTransformerDirective];
const thirdPartyImports = [TranslocoDirective];
const taigaUiImports = [
	TuiButton,
	TuiSelectModule,
	TuiDataListWrapper,
	TuiTextfieldControllerModule,
	TuiTextfield,
	TuiLet,
	TuiInputDateTimeModule,
	TuiFilterByInputPipe,
	TuiStringifyContentPipe,
	TuiComboBoxModule,
];

@Component({
	selector: 'app-record-form',
	standalone: true,
	imports: [...angularImports, ...firstPartyImports, ...thirdPartyImports, ...taigaUiImports],
	template: `
		<form class="flex flex-col space-y-2" [formGroup]="form" *transloco="let transloco">
			<div class="w-full">
				<ng-container *ngTemplateOutlet="inputTemplate; context: { formControlName: 'id', type: 'text' }" />
			</div>
			<div class="flex space-x-2">
				<div class="w-1/2">
					<ng-container *ngTemplateOutlet="inputTemplate; context: { formControlName: 'arrival', type: 'datetime' }" />
				</div>
				<div class="w-1/2">
					<ng-container *ngTemplateOutlet="inputTemplate; context: { formControlName: 'leaving', type: 'datetime' }" />
				</div>
			</div>
			<div class="flex space-x-2">
				<div class="w-1/2">
					<ng-container *ngTemplateOutlet="inputTemplate; context: { formControlName: 'from', type: 'text' }" />
				</div>
				<div class="w-1/2">
					<ng-container *ngTemplateOutlet="inputTemplate; context: { formControlName: 'to', type: 'date' }" />
				</div>
			</div>
			<div class="w-full">
				<ng-container *ngTemplateOutlet="dropdownTemplate; context: { formControlName: 'specialty', array: specialties() }" />
			</div>
			<button tuiButton class="w-full" type="button" size="m" (click)="save()">
				<span class="mr-2 font-normal">{{ transloco('general.save') }}</span>
			</button>

			<ng-template let-formControlName="formControlName" let-type="type" let-array="array" #inputTemplate>
				<label>
					{{ transloco('records.' + formControlName) }}
					@switch (type) { @case ('datetime') {
					<tui-input-date-time toNativeDatetime [formControlName]="formControlName" [tuiTextfieldLabelOutside]="true" />
					} @default {
					<tui-textfield>
						<input tuiTextfield [formControlName]="formControlName" type="text" (keypress)="keyPress($event)" />
					</tui-textfield>
					} }
				</label>
			</ng-template>

			<ng-template let-formControlName="formControlName" let-array="array" #dropdownTemplate>
				<label>
					{{ transloco('records.' + formControlName) }}
					<tui-combo-box [formControlName]="formControlName" [stringify]="stringify" [tuiTextfieldLabelOutside]="true">
						<input tuiTextfieldLegacy (keypress)="keyPress($event)" />
						<tui-data-list-wrapper *tuiDataList [items]="array | tuiFilterByInput" [itemContent]="stringify | tuiStringifyContent" />
					</tui-combo-box>
				</label>
			</ng-template>
		</form>
	`,
	styles: `
    :host {
      display: block;
    }
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordFormComponent {
	private readonly translocoService = inject(TranslocoService);

	public readonly context = inject<TuiDialogContext<IRecord, IRecord | null>>(POLYMORPHEUS_CONTEXT);
	public readonly specialties = signal(SPECIALTIES);

	public readonly form = new FormGroup<IRecordForm>({
		uuid: new FormControl<string | null>(this.context.data?.uuid),
		id: new FormControl<string>(this.context.data?.id ?? '', { nonNullable: true }),
		arrival: new FormControl<Date>(this.context.data?.arrival ?? new Date(), { nonNullable: true }),
		leaving: new FormControl<Date>(this.context.data?.leaving ?? new Date(), { nonNullable: true }),
		from: new FormControl<string>(this.context.data?.from ?? '', { nonNullable: true }),
		to: new FormControl<string>(this.context.data?.to ?? '', { nonNullable: true }),
		specialty: new FormControl<Specialty>('internal', { nonNullable: true }),
	});

	public save(): void {
		const record: IRecord = {
			...this.form.getRawValue(),
			uuid: this.form.getRawValue().uuid ?? this.getId(),
		};
		this.context.completeWith(record);
	}

	public keyPress(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			this.save();
		}
	}

	protected readonly stringify = (item: string): string => this.translocoService.translate('specialty.' + item);

	private getId(): string {
		if ('randomUUID' in crypto) return crypto.randomUUID();

		return this.uid();
	}

	private uid(): string {
		return Date.now().toString(36) + Math.random().toString(36).slice(2);
	}
}