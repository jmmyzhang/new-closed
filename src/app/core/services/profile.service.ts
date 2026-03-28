import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Profile } from '../database.types';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private _profile = signal<Profile | null>(null);
  private _isLoading = signal(false);

  readonly profile = this._profile.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor(private supabase: SupabaseService) {}

  async loadByUsername(username: string): Promise<void> {
    this._isLoading.set(true);
    const { data } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    this._profile.set(data ?? null);
    this._isLoading.set(false);
  }

  async loadById(id: string): Promise<void> {
    this._isLoading.set(true);
    const { data } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    this._profile.set(data ?? null);
    this._isLoading.set(false);
  }

  async updateProfile(
    id: string,
    updates: Partial<Pick<Profile, 'bio' | 'display_name' | 'avatar_url'>>
  ): Promise<{ error: any }> {
    const { error } = await this.supabase.client
      .from('profiles')
      .update(updates)
      .eq('id', id);
    if (!error) {
      this._profile.update(p => (p ? { ...p, ...updates } : p));
    }
    return { error };
  }

  clear(): void {
    this._profile.set(null);
  }
}
