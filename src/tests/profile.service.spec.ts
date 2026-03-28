import { TestBed } from '@angular/core/testing';
import { ProfileService } from '../app/core/services/profile.service';
import { SupabaseService } from '../app/core/services/supabase.service';

const mockProfile = {
  id: 'user-1',
  username: 'testuser',
  display_name: null,
  bio: null,
  avatar_url: null,
  created_at: '2026-01-01'
};

describe('ProfileService', () => {
  let service: ProfileService;
  let mockSupabase: any;

  function buildMock(returnData: any) {
    return {
      client: {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: returnData, error: null })
            })
          }),
          update: (updates: any) => ({
            eq: () => Promise.resolve({ error: null })
          })
        })
      }
    };
  }

  beforeEach(() => {
    mockSupabase = buildMock(mockProfile);
    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        { provide: SupabaseService, useValue: mockSupabase }
      ]
    });
    service = TestBed.inject(ProfileService);
  });

  it('starts with null profile and not loading', () => {
    expect(service.profile()).toBeNull();
    expect(service.isLoading()).toBe(false);
  });

  it('loadByUsername sets profile signal', async () => {
    await service.loadByUsername('testuser');
    expect(service.profile()?.username).toBe('testuser');
    expect(service.isLoading()).toBe(false);
  });

  it('loadById sets profile signal', async () => {
    await service.loadById('user-1');
    expect(service.profile()?.id).toBe('user-1');
  });

  it('clear() resets profile to null', async () => {
    await service.loadByUsername('testuser');
    service.clear();
    expect(service.profile()).toBeNull();
  });
});
