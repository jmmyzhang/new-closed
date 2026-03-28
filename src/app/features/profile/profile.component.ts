import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ClothingItemService } from '../../core/services/clothing-item.service';
import { ProfileHeaderComponent } from './profile-header.component';
import { ClosetGridComponent } from './closet-grid.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ProfileHeaderComponent, ClosetGridComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private itemService = inject(ClothingItemService);

  readonly profile = this.profileService.profile;
  readonly isLoading = this.profileService.isLoading;
  readonly pieceCount = this.itemService.items;

  activeSubnav: 'closet' | 'outfits' | 'collections' = 'closet';

  ngOnInit() {
    const userId = this.auth.user()?.id;
    if (userId) this.profileService.loadById(userId);
  }
}
