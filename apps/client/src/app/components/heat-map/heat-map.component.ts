import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IRecord, SPECIALTIES } from '../../models';
import { DATA_STORAGE_KEY } from '../../shared/models';
import { fromCache } from '../../shared/utils';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import { FormsModule } from '@angular/forms';
import { TuiDayRange, TuiDay } from '@taiga-ui/cdk';
import { getHeatMap } from './utils/get-heat-map/get-heat-map.util';
import { DatePipe, KeyValue, NgClass } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { TuiButton } from '@taiga-ui/core';
import { map } from 'rxjs';

@Component({
	selector: 'app-heat-map',
	standalone: true,
	imports: [NgClass, FormsModule, DatePipe, TuiInputDateRangeModule, TuiButton, TranslocoDirective],
	template: `
		<ng-container *transloco="let transloco">
			<div class="flex flex-col">
				@for (day of heatMap(); track $index; let firstRow = $first) {
					<div class="flex items-end ">
						<div class="w-20 font-bold mr-2">{{ day.key | date: 'shortDate' : undefined : locale() }}</div>
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
				<div class="flex space-x-2" data-html2canvas-ignore>
					<tui-input-date-range toNativeDate [(ngModel)]="dateRange" class="w-60">
						{{ transloco('heatmap.chooseRange') }}
						<input placeholder="From - To" tuiTextfieldLegacy />
					</tui-input-date-range>
					<button type="button" tuiButton (click)="print()">Print</button>
				</div>

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
								{{ sumSpecialty() }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</ng-container>
	`,
	styles: `
		:host {
			@apply flex space-x-2 justify-center p-2;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatMapComponent {
	private readonly data = fromCache<IRecord[]>(DATA_STORAGE_KEY, []);
	private readonly hostElement = inject(ElementRef<HTMLElement>);
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

	public readonly sumSpecialty = computed(() => this.groupedBySpecialty().reduce((acc, curr) => acc + curr.value, 0));

	public print(): void {
		html2canvas(this.hostElement.nativeElement, { scale: 2 }).then((canvas) => {
			const pdf = new jsPDF({ orientation: 'landscape', format: 'a4' });
			const imgData = canvas.toDataURL('image/png');
			const imgWidth = canvas.width;
			const imgHeight = canvas.height;

			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();

			const aspectRatio = imgWidth / imgHeight;
			let pdfWidthToUse = pdfWidth;
			let pdfHeightToUse = pdfWidthToUse / aspectRatio || pdfHeight;

			if (pdfHeightToUse > pdfHeight) {
				pdfHeightToUse = pdfHeight;
				pdfWidthToUse = pdfHeightToUse * aspectRatio;
			}

			const x = (pdfWidth - pdfWidthToUse) / 2;
			const y = (pdfHeight - pdfHeightToUse) / 2;

			pdf.addImage(imgData, 'PNG', x, y, pdfWidthToUse, pdfHeightToUse);
			let locale = 'en-GB';
			switch (this.translocoService.getActiveLang()) {
				case 'de':
					locale = 'de-DE';
					break;
				default:
					break;
			}
			const text =
				new DatePipe(locale).transform(
					new Date(this.dateRange().from.year, this.dateRange().from.month, this.dateRange().from.day, 0, 0, 0),
					'MMMM yyyy',
				) ?? 'Heatmap';

			pdf.setFontSize(12);
			pdf.text(text, pdfWidth / 2, 5);
			pdf.save('heatmap.pdf');
		});
	}

	private initialDateRange(): TuiDayRange {
		const now = startOfMonth(new Date());
		const end = endOfMonth(now);

		return new TuiDayRange(
			new TuiDay(now.getFullYear(), now.getMonth(), now.getDate()),
			new TuiDay(end.getFullYear(), end.getMonth(), end.getDate()),
		);
	}
}
