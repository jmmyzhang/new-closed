import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClothingItem } from '../../core/database.types';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss'
})
export class ItemCardComponent {
  @Input({ required: true }) item!: ClothingItem;
  @Input({ required: true }) username!: string;
}
