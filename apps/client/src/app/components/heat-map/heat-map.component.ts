import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IRecord } from '../../models';
import { DATA_STORAGE_KEY } from '../../shared/models';
import { fromCache } from '../../shared/utils';
import { startOfMonth, endOfMonth, isSameDay, isSameHour, setHours, addDays } from 'date-fns';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import { FormsModule } from '@angular/forms';
import { TuiDayRange, TuiDay } from '@taiga-ui/cdk';
import { getHeatMap } from './utils/get-heat-map.util';
import { DatePipe, NgClass } from '@angular/common';

@Component({
	selector: 'app-heat-map',
	standalone: true,
	imports: [NgClass, FormsModule, DatePipe, TuiInputDateRangeModule],
	template: `
		<div class="flex flex-col">
			@for (day of heatMap(); track $index; let firstRow = $first) {
				<div class="flex items-end ">
					<div class="w-20 text-right mr-2">{{ day.key | date: 'dd.MM.yyyy' }}</div>
					@for (hour of day.value; track $index) {
						<div class="flex flex-col items-center ">
							@if (firstRow) {
								<span>{{ $index }}:00</span>
							}
							<div
								class="flex items-center justify-center border border-black size-10 box"
								[ngClass]="hour.length >= 50 ? 'bg-red-500' : hour.length >= 45 ? 'bg-yellow-500' : 'bg-green-500'">
								{{ hour.length }}
							</div>
						</div>
					}
				</div>
			}
		</div>
		<tui-input-date-range toNativeDate [(ngModel)]="dateRange" class="w-60 h-max">
			Choose dates
			<input placeholder="From - To" tuiTextfieldLegacy />
		</tui-input-date-range>
	`,
	styles: `
		:host {
			@apply flex space-x-2;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatMapComponent {
	private readonly data = fromCache<IRecord[]>(DATA_STORAGE_KEY, []);

	public readonly dateRange = signal<TuiDayRange>(this.initialDateRange());

	public readonly heatMap = computed(() => {
		const records = this.data().sort((a, b) => a.arrival.getTime() - b.arrival.getTime());

		return getHeatMap(
			records,
			new Date(this.dateRange().from.year, this.dateRange().from.month, this.dateRange().from.day, 0, 0, 0),
			new Date(this.dateRange().to.year, this.dateRange().to.month, this.dateRange().to.day, 23, 59, 59),
		);
	});

	private initialDateRange(): TuiDayRange {
		const now = startOfMonth(new Date());
		const end = endOfMonth(now);

		return new TuiDayRange(
			new TuiDay(now.getFullYear(), now.getMonth(), now.getDate()),
			new TuiDay(end.getFullYear(), end.getMonth(), end.getDate()),
		);
	}

	private getRandomDateBetween(start: Date, end: Date): Date {
		const startTime = start.getTime();
		const endTime = end.getTime();
		const randomTime = Math.floor(Math.random() * (endTime - startTime + 1)) + startTime;
		return new Date(randomTime);
	}
}
