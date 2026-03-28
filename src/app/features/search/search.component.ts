import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  private searchService = inject(SearchService);

  query = signal('');
  readonly results = this.searchService.results;
  readonly isSearching = this.searchService.isSearching;

  onInput(value: string) {
    this.query.set(value);
    this.searchService.search(value);
  }
}
