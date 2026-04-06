import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  private _session = signal<Session | null>(null);
  private _sessionReady = signal(false);

  readonly session = this._session.asReadonly();
  readonly sessionReady = this._sessionReady.asReadonly();
  readonly user = computed(() => this._session()?.user ?? null);
  readonly isLoggedIn = computed(() => this._session() !== null);

  constructor() {
    // Hydrate session from local storage on startup
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this._sessionReady.set(true);
    });

    // Keep session in sync with Supabase auth state changes
    this.supabase.auth.onAuthStateChange((_, session) => {
      this._session.set(session);
    });
  }

  async signUp(email: string, password: string, username: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) return { error, needsEmailConfirmation: false };
    // When email confirmation is required, session is null but user is not
    const needsEmailConfirmation = !!data.user && !data.session;
    return { error: null, needsEmailConfirmation };
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.router.navigate(['/login']);
  }
}
