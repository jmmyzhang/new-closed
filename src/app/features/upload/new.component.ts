import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UploadService } from './upload.service';

const CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories'] as const;

@Component({
  selector: 'app-new',
  imports: [FormsModule],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss'
})
export class NewComponent {
  private uploadService = inject(UploadService);
  private router = inject(Router);

  readonly categories = CATEGORIES;
  readonly stage = this.uploadService.stage;
  readonly progress = this.uploadService.progress;
  readonly processedBlob = this.uploadService.processedBlob;
  readonly modelReady = this.uploadService.modelReady;
  readonly uploadError = this.uploadService.error;

  brand = signal('');
  season = signal('');
  name = signal('');
  category = signal('');
  description = signal('');
  size = signal('');

  originalPreviewUrl = signal<string | null>(null);
  processedPreviewUrl = signal<string | null>(null);

  saving = signal(false);
  saveError = signal<string | null>(null);

  readonly canSubmit = computed(() =>
    this.stage() === 'done' &&
    !!this.brand() &&
    !!this.name() &&
    !!this.category() &&
    !!this.size()
  );

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Revoke previous URL to avoid memory leaks
    const prev = this.originalPreviewUrl();
    if (prev) URL.revokeObjectURL(prev);
    this.originalPreviewUrl.set(URL.createObjectURL(file));
    this.processedPreviewUrl.set(null);

    this.uploadService.processImage(file);

    // Poll for processed blob (worker is async)
    const poll = setInterval(() => {
      const blob = this.uploadService.processedBlob();
      const stage = this.uploadService.stage();
      if (blob) {
        const prevProcessed = this.processedPreviewUrl();
        if (prevProcessed) URL.revokeObjectURL(prevProcessed);
        this.processedPreviewUrl.set(URL.createObjectURL(blob));
        clearInterval(poll);
      }
      if (stage === 'error') clearInterval(poll);
    }, 250);
  }

  async onSubmit() {
    this.saveError.set(null);
    this.saving.set(true);
    const { error } = await this.uploadService.uploadAndSave({
      name: this.name(),
      brand: this.brand(),
      season: this.season(),
      category: this.category(),
      description: this.description(),
      size: this.size(),
    });
    this.saving.set(false);
    if (error) {
      this.saveError.set((error as any).message ?? String(error));
    } else {
      this.uploadService.reset();
      this.router.navigate(['/profile']);
    }
  }
}
