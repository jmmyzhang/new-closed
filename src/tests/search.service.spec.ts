import { TestBed } from '@angular/core/testing';
import { SearchService } from '../app/features/search/search.service';
import { SupabaseService } from '../app/core/services/supabase.service';

const mockProfile = {
  id: '1', username: 'testuser', display_name: null,
  bio: null, avatar_url: null, created_at: '2026-01-01'
};

describe('SearchService', () => {
  let service: SearchService;

  function buildMock(data: any[]) {
    return {
      client: {
        from: () => ({
          select: () => ({
            ilike: () => ({
              limit: () => Promise.resolve({ data, error: null })
            })
          })
        })
      }
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService,
        { provide: SupabaseService, useValue: buildMock([mockProfile]) }
      ]
    });
    service = TestBed.inject(SearchService);
  });

  it('starts with empty results and not searching', () => {
    expect(service.results()).toEqual([]);
    expect(service.isSearching()).toBe(false);
  });

  it('search() populates results', async () => {
    await service.search('test');
    expect(service.results()).toHaveLength(1);
    expect(service.results()[0].username).toBe('testuser');
    expect(service.isSearching()).toBe(false);
  });

  it('search() with empty query clears results', async () => {
    await service.search('test');
    await service.search('');
    expect(service.results()).toEqual([]);
  });

  it('clearResults() empties results', async () => {
    await service.search('test');
    service.clearResults();
    expect(service.results()).toEqual([]);
  });
});
