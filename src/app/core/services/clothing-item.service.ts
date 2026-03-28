import { Injectable, computed, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ClothingItem } from '../database.types';

export type CategoryFilter = 'All' | 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear' | 'Accessories';

@Injectable({ providedIn: 'root' })
export class ClothingItemService {
  private _items = signal<ClothingItem[]>([]);
  private _activeFilter = signal<CategoryFilter>('All');
  private _isLoading = signal(false);

  readonly items = this._items.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly activeFilter = this._activeFilter.asReadonly();

  readonly filteredItems = computed(() => {
    const filter = this._activeFilter();
    const items = this._items();
    if (filter === 'All') return items;
    return items.filter(item => item.category === filter);
  });

  constructor(private supabase: SupabaseService) {}

  async loadForUser(userId: string): Promise<void> {
    this._isLoading.set(true);
    const { data } = await this.supabase.client
      .from('clothing_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    this._items.set(data ?? []);
    this._isLoading.set(false);
  }

  async loadById(id: string): Promise<ClothingItem | null> {
    const { data } = await this.supabase.client
      .from('clothing_items')
      .select('*')
      .eq('id', id)
      .single();
    return data ?? null;
  }

  setFilter(filter: CategoryFilter): void {
    this._activeFilter.set(filter);
  }

  clear(): void {
    this._items.set([]);
    this._activeFilter.set('All');
  }
}
