import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IRecord, SPECIALTIES, Specialty } from '../../models';
import { DATA_STORAGE_KEY } from '../../shared/models';
import { fromCache } from '../../shared/utils';
import { startOfMonth, endOfMonth, isSameDay, isSameHour, setHours, addDays, isWithinInterval } from 'date-fns';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import { FormsModule } from '@angular/forms';
import { TuiDayRange, TuiDay } from '@taiga-ui/cdk';
import { getHeatMap } from './utils/get-heat-map/get-heat-map.util';
import { DatePipe, KeyValue, NgClass } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'app-heat-map',
	standalone: true,
	imports: [NgClass, FormsModule, DatePipe, TuiInputDateRangeModule, TranslocoDirective],
	template: `
		<ng-container *transloco="let transloco">
			<div class="flex flex-col">
				@for (day of heatMap(); track $index; let firstRow = $first) {
					<div class="flex items-end ">
						<div class="w-20 font-bold mr-2">{{ day.key | date: 'dd.MM.yyyy' }}</div>
						@for (hour of day.value; track $index) {
							<div class="flex flex-col items-center ">
								@if (firstRow) {
									<span class="font-bold">{{ $index }}:00</span>
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
			<div class="flex flex-col space-y-2">
				<tui-input-date-range toNativeDate [(ngModel)]="dateRange" class="w-60">
					{{ transloco('heatmap.chooseRange') }}
					<input placeholder="From - To" tuiTextfieldLegacy />
				</tui-input-date-range>

				<div class="flex flex-col items-center space-y-2">
					<span class="font-bold">{{ transloco('heatmap.specialty') }}</span>
					<div class="flex flex-col">
						@for (specialty of groupedBySpecialty(); track $index) {
							<div class="flex items-center w-max border-black first:border-t">
								<span class="w-28 font-bold p-2 border-b border-l border-r border-black">{{ transloco('specialty.' + specialty.key) }}</span>
								<div class="flex items-center justify-center h-full w-10 border-b border-r border-black">
									{{ specialty.value }}
								</div>
							</div>
						}

						<div class="flex items-center w-max border-black first:border-t">
							<span class="w-28 font-bold p-2 border-b border-l border-r border-black">{{ transloco('heatmap.total') }}</span>
							<div class="flex items-center justify-center h-full w-10 font-bold border-b border-r border-black">
								{{ sumSpecity() }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</ng-container>
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

	public readonly heatMap = computed(() =>
		getHeatMap(
			this.data(),
			new Date(this.dateRange().from.year, this.dateRange().from.month, this.dateRange().from.day, 0, 0, 0),
			new Date(this.dateRange().to.year, this.dateRange().to.month, this.dateRange().to.day, 23, 59, 59),
		),
	);

	public readonly groupedBySpecialty = computed(() => {
		const hashMap = new Map<string, number>();
		const filteredData = this.data().filter((record) =>
			isWithinInterval(record.arrival, {
				start: new Date(this.dateRange().from.year, this.dateRange().from.month, this.dateRange().from.day, 0, 0, 0),
				end: new Date(this.dateRange().to.year, this.dateRange().to.month, this.dateRange().to.day, 23, 59, 59),
			}),
		);

		for (const specialty of SPECIALTIES) {
			hashMap.set(specialty, 0);
		}

		for (const record of filteredData) {
			const value = hashMap.get(record.specialty) ?? 0;
			hashMap.set(record.specialty, value + 1);
		}

		const array: KeyValue<string, number>[] = [];
		hashMap.forEach((value, key) => {
			array.push({ key, value });
		});

		return array;
	});

	public readonly sumSpecity = computed(() => this.groupedBySpecialty().reduce((acc, curr) => acc + curr.value, 0));

	private initialDateRange(): TuiDayRange {
		const now = startOfMonth(new Date());
		const end = endOfMonth(now);

		return new TuiDayRange(
			new TuiDay(now.getFullYear(), now.getMonth(), now.getDate()),
			new TuiDay(end.getFullYear(), end.getMonth(), end.getDate()),
		);
	}
}
