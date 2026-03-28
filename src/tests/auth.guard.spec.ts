import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { authGuard } from '../app/core/guards/auth.guard';
import { AuthService } from '../app/core/services/auth.service';

describe('authGuard', () => {
  function setup(sessionReady: boolean, loggedIn: boolean) {
    const mockAuth = {
      sessionReady: signal(sessionReady).asReadonly(),
      isLoggedIn: signal(loggedIn).asReadonly(),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: Router, useValue: { createUrlTree: (path: string[]) => path } }
      ]
    });
    return TestBed.inject(Router);
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('redirects to /login when session ready but not logged in', async () => {
    setup(true, false);
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    ) as any;
    expect(result).toEqual(['/login']);
  });

  it('returns true when session ready and logged in', async () => {
    setup(true, true);
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );
    expect(result).toBe(true);
  });
});
