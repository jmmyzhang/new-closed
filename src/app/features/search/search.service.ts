import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { Profile } from '../../core/database.types';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private supabase = inject(SupabaseService);

  private _results = signal<Profile[]>([]);
  private _isSearching = signal(false);

  readonly results = this._results.asReadonly();
  readonly isSearching = this._isSearching.asReadonly();

  async search(query: string): Promise<void> {
    if (!query.trim()) {
      this._results.set([]);
      return;
    }
    this._isSearching.set(true);
    const { data } = await this.supabase.client
      .from('profiles')
      .select('*')
      .ilike('username', `${query.trim()}%`)
      .limit(20);
    this._results.set(data ?? []);
    this._isSearching.set(false);
  }

  clearResults(): void {
    this._results.set([]);
  }
}
