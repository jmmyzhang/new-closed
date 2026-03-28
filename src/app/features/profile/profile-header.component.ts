import { Component, Input } from '@angular/core';
import { Profile } from '../../core/database.types';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss'
})
export class ProfileHeaderComponent {
  @Input({ required: true }) profile!: Profile;
  @Input() pieceCount = 0;
}
