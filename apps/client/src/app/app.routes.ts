import { Route } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation.component';

export const appRoutes: Route[] = [
	{
		path: '',
		component: NavigationComponent,
		children: [
			{
				path: 'records',
				component: NavigationComponent,
				data: {
					translationKey: 'records',
				},
			},
		],
	},
];
