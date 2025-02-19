import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/services/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withFetch(),                      // Habilitar `fetch` en `HttpClient`
      withInterceptors([AuthInterceptor]) // Registrar el interceptor
    ),
    ...appConfig.providers              // Mantener las configuraciones previas de appConfig
  ],
})
  .catch((err) => console.error(err));
