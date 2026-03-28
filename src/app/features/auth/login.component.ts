import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    const { error } = await this.auth.signIn(this.email(), this.password());
    this.loading.set(false);
    if (error) {
      this.error.set(error.message);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}
