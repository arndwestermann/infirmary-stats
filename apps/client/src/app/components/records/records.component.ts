import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiButton, tuiDialog, TuiDialogContext, TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { IRecord } from '../../models';
import { DatePipe } from '@angular/common';

import { addDays, endOfMonth, format, getDate, isSameDay, isSameHour, setDate, setHours, startOfMonth } from 'date-fns';
import { CacheService } from '../../shared/services';
import { DATA_STORAGE_KEY, NEVER_ASK_DELETE_AGAIN_STORAGE_KEY } from '../../shared/models';
import { fromCache } from '../../shared/utils';

import { map, tap } from 'rxjs';

import { RecordFormComponent } from './components/record-form/record-form.component';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiStatus } from '@taiga-ui/kit';
import { ConfirmDeleteComponent } from './components/confirm-delete/confirm-delete.component';
import { toSignal } from '@angular/core/rxjs-interop';

const angularImports = [DatePipe];
const taigaUiImports = [TuiButton, TuiIcon, TuiTable, TuiStatus];
const thirdPartyImports = [TranslocoDirective];
@Component({
	selector: 'app-records',
	standalone: true,
	imports: [...angularImports, ...taigaUiImports, ...thirdPartyImports],
	template: `
		<div class="flex flex-shrink-0">
			<button type="button" tuiButton appearance="primary" size="s" (click)="openDialog()">
				<tui-icon icon="@tui.fa.solid.plus" />
			</button>
		</div>
		<div class="grow overflow-y-auto">
			<table tuiTable class="w-full" [columns]="columns()">
				<thead *transloco="let transloco; prefix: 'records'">
					<tr tuiThGroup>
						@for (column of columns(); track column) {
							<th *tuiHead="column" tuiTh [sorter]="null" [sticky]="true">
								{{ transloco(column) }}
							</th>
						}
					</tr>
				</thead>
				<tbody tuiTbody [data]="data()" class="group" *transloco="let transloco; prefix: 'specialty'">
					@for (item of data(); track $index) {
						<tr tuiTr (click)="openDialog(item)">
							<td *tuiCell="'id'" tuiTd>
								{{ item.id }}
							</td>
							<td *tuiCell="'arrival'" tuiTd>
								{{ item.arrival | date: 'short' : undefined : locale() }}
							</td>
							<td *tuiCell="'leaving'" tuiTd>
								{{ item.leaving | date: 'short' : undefined : locale() }}
							</td>
							<td *tuiCell="'from'" tuiTd>
								{{ item.from }}
							</td>
							<td *tuiCell="'to'" tuiTd>
								{{ item.to }}
							</td>
							<td *tuiCell="'specialty'" tuiTd>
								{{ transloco(item.specialty) }}
							</td>

							<td *tuiCell="'actions'" tuiTd class="flex justify-center">
								<button
									appearance="flat-destructive"
									iconStart="@tui.fa.solid.trash"
									size="s"
									tuiIconButton
									type="button"
									(click)="deleteRecord($event, item.uuid)"></button>
							</td>
						</tr>
					}
				</tbody>
			</table>
		</div>
	`,
	styles: `
		:host {
			@apply flex flex-col h-full p-4 space-y-4;
		}

		[tuiTh],
		[tuiTd] {
			border-inline-start: none;
			border-inline-end: none;
		}

		[tuiTr]:hover td {
			@apply bg-gray-200 cursor-pointer;
		}

		[tuiTable][data-size='s'] [tuiTitle] {
			flex-direction: row;
			gap: 0.375rem;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsComponent {
	private readonly dialogService = inject(TuiDialogService);

	private readonly translocoService = inject(TranslocoService);

	public readonly locale = toSignal(
		this.translocoService.langChanges$.pipe(
			map((lang) => {
				let locale = 'en-GB';
				switch (lang) {
					case 'de':
						locale = 'de-DE';
						break;
					default:
						break;
				}

				return locale;
			}),
		),
		{ initialValue: this.translocoService.getActiveLang() },
	);

	public readonly data = fromCache<IRecord[]>(DATA_STORAGE_KEY, []);
	public readonly neverAskAgain = fromCache<boolean>(NEVER_ASK_DELETE_AGAIN_STORAGE_KEY, false);
	public readonly columns = computed(() => ['id', 'arrival', 'leaving', 'from', 'to', 'specialty', 'actions']);

	public openDialog(record?: IRecord): void {
		this.dialogService
			.open<IRecord | null>(new PolymorpheusComponent(RecordFormComponent), {
				data: record ?? null,
				dismissible: true,
				size: 'm',
			})
			.pipe(
				tap((value) => {
					if (value)
						this.data.update((records) => {
							const existingRecord = records.find((record) => record.uuid === value.uuid);
							if (existingRecord) {
								const index = records.indexOf(existingRecord);
								return [...records.slice(0, index), value, ...records.slice(index + 1)];
							}

							return [...records, value];
						});
				}),
			)
			.subscribe();
	}

	public deleteRecord(event: Event, uuid: string): void {
		event.stopPropagation();

		if (this.neverAskAgain()) {
			this.removeRecord(uuid);
			return;
		}

		this.dialogService
			.open<{ delete: boolean; neverAskAgain: boolean }>(new PolymorpheusComponent(ConfirmDeleteComponent), {
				dismissible: true,
				size: 'm',
			})
			.pipe(
				tap((value) => {
					console.log(value);
					if (value.delete === true) this.removeRecord(uuid);
					if (value.neverAskAgain === true) this.neverAskAgain.set(true);
				}),
			)
			.subscribe();
	}

	private removeRecord(uuid: string): void {
		this.data.update((records) => records.filter((record) => record.uuid !== uuid));
	}
}
