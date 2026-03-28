import { Component, Input, OnInit, inject } from '@angular/core';
import { ProfileService } from '../../core/services/profile.service';
import { ClothingItemService } from '../../core/services/clothing-item.service';
import { ProfileHeaderComponent } from './profile-header.component';
import { ClosetGridComponent } from './closet-grid.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [ProfileHeaderComponent, ClosetGridComponent],
  templateUrl: './public-profile.component.html'
})
export class PublicProfileComponent implements OnInit {
  @Input({ required: true }) username!: string;

  private profileService = inject(ProfileService);
  private itemService = inject(ClothingItemService);

  readonly profile = this.profileService.profile;
  readonly isLoading = this.profileService.isLoading;
  readonly pieceCount = this.itemService.items;

  activeSubnav: 'closet' | 'outfits' | 'collections' = 'closet';

  ngOnInit() {
    this.profileService.loadByUsername(this.username);
  }
}
