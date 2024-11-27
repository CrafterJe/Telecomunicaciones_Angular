import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { withFetch } from '@angular/common/http';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),  // Habilitar `fetch` en `HttpClient`
    ...appConfig.providers           // Mantener las configuraciones previas de appConfig
  ],
})
  .catch((err) => console.error(err));
