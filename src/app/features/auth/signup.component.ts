import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  email = signal('');
  password = signal('');
  username = signal('');
  error = signal<string | null>(null);
  loading = signal(false);
  confirmed = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    const { error, needsEmailConfirmation } = await this.auth.signUp(
      this.email(),
      this.password(),
      this.username(),
    );
    this.loading.set(false);
    if (error) {
      this.error.set((error as any).message ?? String(error));
    } else if (needsEmailConfirmation) {
      this.confirmed.set(true);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}
