import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { IRecord } from '../../models';
import { DatePipe } from '@angular/common';

import { addDays, endOfMonth, format, getDate, isSameDay, isSameHour, setDate, setHours, startOfMonth } from 'date-fns';
import { CacheService } from '../../shared/services';
import { DATA_STORAGE_KEY } from '../../shared/models';
import { fromCache } from '../../shared/utils';

const angularImports = [DatePipe];
const taigaUiImports = [TuiButton, TuiIcon, TuiTable];
@Component({
	selector: 'app-records',
	standalone: true,
	imports: [...angularImports, ...taigaUiImports],
	template: `
		<div class="flex flex-shrink-0">
			<button type="button" tuiButton appearance="primary" size="s">
				<tui-icon icon="@tui.fa.solid.plus" />
			</button>
		</div>
		<div class="grow overflow-y-auto">
			<table tuiTable class="w-full" [columns]="columns()">
				<thead>
					<tr tuiThGroup>
						@for (column of columns(); track column) {
						<th *tuiHead="column" tuiTh [sorter]="null" [sticky]="true">
							{{ column }}
						</th>
						}
					</tr>
				</thead>
				<tbody tuiTbody [data]="data()">
					@for (item of data(); track $index) {

					<tr tuiTr>
						<td *tuiCell="'id'" tuiTd>
							{{ item.id }}
						</td>
						<td *tuiCell="'arrival'" tuiTd>
							{{ item.arrival | date : 'medium' : undefined : 'de-DE' }}
						</td>
						<td *tuiCell="'leaving'" tuiTd>
							{{ item.leaving | date : 'medium' : undefined : 'de-DE' }}
						</td>
						<td *tuiCell="'from'" tuiTd>
							{{ item.from }}
						</td>
						<td *tuiCell="'to'" tuiTd>
							{{ item.to }}
						</td>
						<td *tuiCell="'specialty'" tuiTd>
							{{ item.specialty }}
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
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsComponent {
	public readonly data = fromCache<IRecord[]>(DATA_STORAGE_KEY, []);

	protected readonly columns = computed(() => (this.data().length > 0 ? Object.keys(this.data()[0]) : []));
}
