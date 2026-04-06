import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<p class="callback-msg">Confirming your account...</p>`,
  styles: [`.callback-msg { margin: 80px auto; text-align: center; font-size: var(--font-size-sm); letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-mid); }`],
})
export class CallbackComponent implements OnInit {
  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  async ngOnInit() {
    // supabase-js automatically exchanges the PKCE code from the URL on init.
    // We just need to wait for the session to land, then redirect.
    const { data } = await this.supabase.auth.getSession();
    if (data.session) {
      this.router.navigate(['/profile'], { replaceUrl: true });
    } else {
      // Session not ready yet — listen for the SIGNED_IN event fired after code exchange
      const { data: listener } = this.supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          listener.subscription.unsubscribe();
          this.router.navigate(['/profile'], { replaceUrl: true });
        }
      });
    }
  }
}
