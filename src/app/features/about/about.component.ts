import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <h1 class="page-title">About</h1>
    <p class="about-body">Closed is a digital wardrobe for cataloging clothing pieces. Built by Jimmy Zhang.</p>
  `,
  styles: [`
    .page-title { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 20px; }
    .about-body { font-size: 11px; color: #888; line-height: 1.7; max-width: 400px; }
  `]
})
export class AboutComponent {}
