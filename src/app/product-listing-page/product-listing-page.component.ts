import { Component, Injectable } from '@angular/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { ProductListingService } from '../service/product-listing.service';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}
@Component({
  selector: 'app-product-listing-page',
  templateUrl: './product-listing-page.component.html',
  styleUrls: ['./product-listing-page.component.scss'],
})
@Injectable({
  providedIn: 'root',
})
export class ProductListingPageComponent {
  searchQuery = '';
  showSuggestions = false;
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;

  private destroy$ = new Subject<void>();

  constructor(private productService: ProductListingService) {}

  ngOnInit() {
    combineLatest([
      this.productService.searchQuery$,
      this.productService.currentPage$,
      this.productService.filteredProducts$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([query, page, filtered]) => {
        this.searchQuery = query;
        this.currentPage = page;
        this.filteredProducts = filtered;
        this.updateDisplayedProducts();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput() {
    this.showSuggestions = true;
    this.productService.updateSearchQuery(this.searchQuery);
    this.productService.updateCurrentPage(1);
  }

  selectSuggestion(product: Product) {
    this.searchQuery = product.name;
    this.showSuggestions = false;
    this.productService.updateSearchQuery(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.productService.updateSearchQuery('');
    this.productService.updateCurrentPage(1);
  }

  setPage(page: number) {
    this.productService.updateCurrentPage(page);
  }

  private updateDisplayedProducts() {
    this.totalPages = Math.ceil(
      this.filteredProducts.length / this.itemsPerPage
    );
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedProducts = this.filteredProducts.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }
}
