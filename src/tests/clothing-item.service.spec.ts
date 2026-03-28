import { TestBed } from '@angular/core/testing';
import { ClothingItemService } from '../app/core/services/clothing-item.service';
import { SupabaseService } from '../app/core/services/supabase.service';

const mockItem = {
  id: 'item-1',
  user_id: 'user-1',
  name: 'Tee',
  brand: 'Raf Simons',
  category: 'Tops',
  description: null,
  size: 'M',
  season: null,
  processed_url: 'https://example.com/img.png',
  original_url: null,
  created_at: '2026-01-01'
};

describe('ClothingItemService', () => {
  let service: ClothingItemService;

  function buildMock(items: any[]) {
    return {
      client: {
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: items, error: null }),
              single: () => Promise.resolve({ data: items[0] ?? null, error: null })
            })
          })
        })
      }
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClothingItemService,
        { provide: SupabaseService, useValue: buildMock([mockItem]) }
      ]
    });
    service = TestBed.inject(ClothingItemService);
  });

  it('starts with empty items and All filter', () => {
    expect(service.items()).toEqual([]);
    expect(service.activeFilter()).toBe('All');
  });

  it('loadForUser populates items signal', async () => {
    await service.loadForUser('user-1');
    expect(service.items()).toHaveLength(1);
    expect(service.items()[0].id).toBe('item-1');
  });

  it('filteredItems returns all when filter is All', async () => {
    await service.loadForUser('user-1');
    expect(service.filteredItems()).toHaveLength(1);
  });

  it('filteredItems filters by category', async () => {
    await service.loadForUser('user-1');
    service.setFilter('Bottoms');
    expect(service.filteredItems()).toHaveLength(0);
  });

  it('setFilter updates activeFilter signal', () => {
    service.setFilter('Tops');
    expect(service.activeFilter()).toBe('Tops');
  });

  it('clear() resets items and filter', async () => {
    await service.loadForUser('user-1');
    service.clear();
    expect(service.items()).toEqual([]);
    expect(service.activeFilter()).toBe('All');
  });
});
