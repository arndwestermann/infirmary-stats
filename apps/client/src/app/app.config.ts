import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, isDevMode, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { registerLocaleData } from '@angular/common';
import { TuiDialog } from '@taiga-ui/core';

import localeEnGB from '@angular/common/locales/en-GB';
import localeDeDE from '@angular/common/locales/de';
import { STORAGE_TOKEN } from './shared/services';

registerLocaleData(localeEnGB, 'en-GB');
registerLocaleData(localeDeDE, 'de-DE');

export function initializeApplication(translocoService: TranslocoService): () => void {
	return () => {
		translocoService.setActiveLang(navigator.language.split('-')[0]);
	};
}

export const appConfig: ApplicationConfig = {
	providers: [
		provideAnimations(),
		provideExperimentalZonelessChangeDetection(),
		provideRouter(appRoutes),
		provideHttpClient(),
		provideTransloco({
			config: {
				availableLangs: ['en', 'de'],
				defaultLang: 'en',
				// Remove this option if your application doesn't support changing language in runtime.
				reRenderOnLangChange: true,
				prodMode: !isDevMode(),
			},
			loader: TranslocoHttpLoader,
		}),

		importProvidersFrom(TuiDialog),
		{ provide: STORAGE_TOKEN, useValue: localStorage },
		NG_EVENT_PLUGINS,
		{
			provide: APP_INITIALIZER,
			useFactory: initializeApplication,
			deps: [TranslocoService],
			multi: true,
		},
	],
};
