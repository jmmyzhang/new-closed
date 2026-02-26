import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  private _session = signal<Session | null>(null);

  readonly session = this._session.asReadonly();
  readonly user = computed(() => this._session()?.user ?? null);
  readonly isLoggedIn = computed(() => this._session() !== null);

  constructor() {
    // Hydrate session from local storage on startup
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
    });

    // Keep session in sync with Supabase auth state changes
    this.supabase.auth.onAuthStateChange((_, session) => {
      this._session.set(session);
    });
  }

  signUp(email: string, password: string, username: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.router.navigate(['/login']);
  }
}
