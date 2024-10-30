import { Route } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';
import { RecordsComponent } from './components/records/records.component';
import { HeatMapComponent } from './components/heat-map/heat-map.component';

export const appRoutes: Route[] = [
	{
		path: '',
		component: NavigationComponent,
		children: [
			{
				path: 'records',
				component: RecordsComponent,
				data: {
					translationKey: 'records',
					icon: 'table-list',
				},
			},
			{
				path: 'heatmap',
				component: HeatMapComponent,
				data: {
					translationKey: 'heatmap',
					icon: 'fire',
				},
			},
			{
				path: '',
				redirectTo: 'records',
				pathMatch: 'full',
			},
		],
	},
];
