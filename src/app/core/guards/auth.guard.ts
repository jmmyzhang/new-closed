import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return new Promise(resolve => {
    toObservable(auth.sessionReady)
      .pipe(filter(ready => ready), take(1))
      .subscribe(() => {
        resolve(auth.isLoggedIn() ? true : router.createUrlTree(['/login']));
      });
  });
};
