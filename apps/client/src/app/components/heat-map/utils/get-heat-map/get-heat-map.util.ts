import { startOfMonth, endOfMonth, isWithinInterval, isSameDay } from 'date-fns';
import { IRecord } from '../../../../models';
import { IHeatMap } from '../../models/heat-map.model';

export function getHeatMap(data: IRecord[], startDate?: Date, endDate?: Date): IHeatMap[] {
	const heatmap: { key: Date; value: IRecord[][] }[] = [];
	const start = startDate || startOfMonth(new Date());
	const end = endDate || endOfMonth(new Date());
	for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
		const dayOverview: IRecord[][] = [];
		for (let hour = 0; hour < 24; hour++) {
			dayOverview.push([]);
		}
		heatmap.push({
			key: new Date(date),
			value: dayOverview,
		});
	}

	for (const entry of data) {
		const daysStaying = heatmap.filter((item) =>
			isWithinInterval(item.key, {
				start: new Date(entry.arrival.getFullYear(), entry.arrival.getMonth(), entry.arrival.getDate(), 0, 0, 0),
				end: new Date(entry.leaving.getFullYear(), entry.leaving.getMonth(), entry.leaving.getDate(), 23, 59, 59),
			}),
		);

		let firstTime = true;
		for (const day of daysStaying) {
			const firstHour = entry.arrival.getHours();
			const lastHour = entry.leaving.getHours();

			const start = firstTime ? firstHour : 0;
			const end = isSameDay(day.key, entry.leaving) ? lastHour : 23;

			for (let hour = start; hour <= end; hour++) {
				day.value[hour].push(entry);
			}

			firstTime = false;
		}
	}

	return heatmap;
}
