import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  // NoPreloading,
  provideRouter,
  // withComponentInputBinding,
  // withInMemoryScrolling,
  // withPreloading,
  // withRouterConfig,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{rose.50}',
      100: '{rose.100}',
      200: '{rose.200}',
      300: '{rose.300}',
      400: '{rose.400}',
      500: '{rose.500}',
      600: '{rose.600}',
      700: '{rose.700}',
      800: '{rose.800}',
      900: '{rose.900}',
      950: '{rose.950}',
    },
    secondary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
  },
});
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideCharts(withDefaultRegisterables()),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),
    // providePrimeNG({
    //   theme: {
    //     preset: Aura,
    //   },
    // }),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
        //   cssLayer: {
        //     name: 'primeng',
        //     order: 'theme, base, primeng',
        //   },
        darkModeSelector: '.dark'
        },

      },
    }),
    provideRouter(
      routes
      // withInMemoryScrolling(),
      // withComponentInputBinding(),
      // withRouterConfig({ paramsInheritanceStrategy: 'always', onSameUrlNavigation: 'reload' }),
      // withPreloading(NoPreloading)
    ),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
  ],
};
