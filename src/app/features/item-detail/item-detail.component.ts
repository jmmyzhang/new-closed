import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClothingItemService } from '../../core/services/clothing-item.service';
import { ProfileService } from '../../core/services/profile.service';
import { ClothingItem } from '../../core/database.types';

@Component({
  selector: 'app-item-detail',
  imports: [RouterLink],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.scss'
})
export class ItemDetailComponent implements OnInit {
  @Input({ required: true }) username!: string;
  @Input({ required: true }) id!: string;

  private itemService = inject(ClothingItemService);
  private profileService = inject(ProfileService);

  item = signal<ClothingItem | null>(null);
  isLoading = signal(true);

  readonly allItems = this.itemService.items;

  readonly currentIndex = computed(() =>
    this.allItems().findIndex(i => i.id === this.id)
  );

  readonly prevItem = computed(() => {
    const idx = this.currentIndex();
    return idx > 0 ? this.allItems()[idx - 1] : null;
  });

  readonly nextItem = computed(() => {
    const idx = this.currentIndex();
    const items = this.allItems();
    return idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;
  });

  async ngOnInit() {
    // Ensure profile and items are loaded (handles direct URL navigation)
    if (!this.profileService.profile()) {
      await this.profileService.loadByUsername(this.username);
    }
    const profile = this.profileService.profile();
    if (profile && this.itemService.items().length === 0) {
      await this.itemService.loadForUser(profile.id);
    }
    // Find item from loaded list, or fetch individually
    const found = this.allItems().find(i => i.id === this.id) ?? null;
    if (found) {
      this.item.set(found);
    } else {
      const loaded = await this.itemService.loadById(this.id);
      this.item.set(loaded);
    }
    this.isLoading.set(false);
  }
}
