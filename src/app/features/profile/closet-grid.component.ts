import { Component, Input, OnInit, inject } from '@angular/core';
import { ClothingItemService, CategoryFilter } from '../../core/services/clothing-item.service';
import { ItemCardComponent } from './item-card.component';

const FILTERS: CategoryFilter[] = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories'];

@Component({
  selector: 'app-closet-grid',
  standalone: true,
  imports: [ItemCardComponent],
  templateUrl: './closet-grid.component.html',
  styleUrl: './closet-grid.component.scss'
})
export class ClosetGridComponent implements OnInit {
  @Input({ required: true }) userId!: string;
  @Input({ required: true }) username!: string;

  private itemService = inject(ClothingItemService);

  readonly filters = FILTERS;
  readonly items = this.itemService.filteredItems;
  readonly activeFilter = this.itemService.activeFilter;
  readonly isLoading = this.itemService.isLoading;

  ngOnInit() {
    this.itemService.loadForUser(this.userId);
  }

  setFilter(f: CategoryFilter) {
    this.itemService.setFilter(f);
  }
}
