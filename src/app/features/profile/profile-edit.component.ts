import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { Profile } from '../../core/database.types';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  @Input({ required: true }) profile!: Profile;
  @Output() done = new EventEmitter<void>();

  private auth = inject(AuthService);
  private profileService = inject(ProfileService);

  displayName = signal('');
  bio = signal('');
  avatarPreview = signal<string | null>(null);
  avatarFile = signal<File | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.displayName.set(this.profile.display_name ?? '');
    this.bio.set(this.profile.bio ?? '');
    this.avatarPreview.set(this.profile.avatar_url ?? null);
  }

  onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.avatarFile.set(file);
    const prev = this.avatarPreview();
    if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
    this.avatarPreview.set(URL.createObjectURL(file));
  }

  async onSave() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.saving.set(true);
    this.error.set(null);

    let avatarUrl = this.profile.avatar_url ?? null;
    const file = this.avatarFile();
    if (file) {
      const { url, error } = await this.profileService.uploadAvatar(userId, file);
      if (error) {
        this.error.set(error.message ?? 'Failed to upload avatar.');
        this.saving.set(false);
        return;
      }
      avatarUrl = url;
    }

    const { error } = await this.profileService.updateProfile(userId, {
      display_name: this.displayName() || null,
      bio: this.bio() || null,
      avatar_url: avatarUrl,
    });

    this.saving.set(false);
    if (error) {
      this.error.set(error.message ?? 'Failed to save profile.');
    } else {
      this.done.emit();
    }
  }

  onCancel() {
    const prev = this.avatarPreview();
    if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
    this.done.emit();
  }
}
