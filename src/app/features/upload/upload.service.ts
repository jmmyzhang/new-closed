import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';

export type ProcessingStage = 'idle' | 'loading-model' | 'processing' | 'done' | 'error';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  private worker: Worker | null = null;

  private _modelReady = signal(false);
  private _stage = signal<ProcessingStage>('idle');
  private _progress = signal(0);
  private _processedBlob = signal<Blob | null>(null);
  private _originalBlob = signal<Blob | null>(null);
  private _error = signal<string | null>(null);

  readonly modelReady = this._modelReady.asReadonly();
  readonly stage = this._stage.asReadonly();
  readonly progress = this._progress.asReadonly();
  readonly processedBlob = this._processedBlob.asReadonly();
  readonly originalBlob = this._originalBlob.asReadonly();
  readonly error = this._error.asReadonly();

  initWorker(): void {
    if (this.worker) return;
    this.worker = new Worker(
      new URL('./bg-removal.worker.ts', import.meta.url),
      { type: 'module' }
    );
    this.worker.onmessage = (event) => this.handleMessage(event.data);
    this.worker.onerror = (err) => {
      this._error.set(err.message);
      this._stage.set('error');
    };
    this.worker.postMessage({ type: 'load' });
    this._stage.set('loading-model');
  }

  private handleMessage(msg: any): void {
    switch (msg.type) {
      case 'ready':
        this._modelReady.set(true);
        this._stage.set('idle');
        break;
      case 'progress':
        this._stage.set(msg.stage === 'loading' ? 'loading-model' : 'processing');
        this._progress.set(msg.pct);
        break;
      case 'done':
        this._processedBlob.set(msg.blob);
        this._stage.set('done');
        this._progress.set(100);
        break;
      case 'error':
        this._error.set(msg.message);
        this._stage.set('error');
        break;
    }
  }

  processImage(file: File): void {
    this._originalBlob.set(file);
    this._processedBlob.set(null);
    this._error.set(null);
    this._stage.set('processing');
    this._progress.set(0);
    this.worker?.postMessage({ type: 'process', blob: file });
  }

  async uploadAndSave(fields: {
    name: string;
    brand: string;
    season: string;
    category: string;
    description: string;
    size: string;
  }): Promise<{ error: any }> {
    const userId = this.auth.user()?.id;
    const processed = this._processedBlob();
    if (!userId || !processed) {
      return { error: new Error('Not authenticated or no processed image') };
    }

    const itemId = crypto.randomUUID();
    const processedPath = `${userId}/processed/${itemId}.png`;

    const { error: uploadError } = await this.supabase.client.storage
      .from('clothing-items')
      .upload(processedPath, processed, { contentType: 'image/png' });
    if (uploadError) return { error: uploadError };

    const original = this._originalBlob();
    let originalUrl: string | null = null;
    if (original) {
      const originalPath = `${userId}/originals/${itemId}.jpg`;
      await this.supabase.client.storage
        .from('clothing-items')
        .upload(originalPath, original);
      originalUrl = this.supabase.client.storage
        .from('clothing-items')
        .getPublicUrl(originalPath).data.publicUrl;
    }

    const processedUrl = this.supabase.client.storage
      .from('clothing-items')
      .getPublicUrl(processedPath).data.publicUrl;

    const { error: dbError } = await this.supabase.client
      .from('clothing_items')
      .insert({
        id: itemId,
        user_id: userId,
        name: fields.name || null,
        brand: fields.brand || null,
        season: fields.season || null,
        category: fields.category || null,
        description: fields.description || null,
        size: fields.size || null,
        processed_url: processedUrl,
        original_url: originalUrl,
      });

    return { error: dbError };
  }

  reset(): void {
    this._stage.set('idle');
    this._progress.set(0);
    this._processedBlob.set(null);
    this._originalBlob.set(null);
    this._error.set(null);
  }
}
