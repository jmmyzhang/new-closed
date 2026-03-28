import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { UploadService } from './features/upload/upload.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    {
      provide: APP_INITIALIZER,
      useFactory: (uploadService: UploadService) => () => uploadService.initWorker(),
      deps: [UploadService],
      multi: true,
    },
  ],
};
