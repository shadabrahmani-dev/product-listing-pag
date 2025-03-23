import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PRODUCT_DETAILS } from '../plp.data';
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductListingService {
  private products: Product[] = [];
  private searchQuerySubject = new BehaviorSubject<string>('');
  private currentPageSubject = new BehaviorSubject<number>(1);

  searchQuery$ = this.searchQuerySubject.asObservable();
  currentPage$ = this.currentPageSubject.asObservable();

  filteredProducts$ = this.searchQuery$.pipe(
    debounceTime(600),
    distinctUntilChanged(),
    map((query) => this.filterProducts(query))
  );

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  private loadProducts() {
    // API getting failed due to Json server not deplyed on vercel, However, the api will work on local.
    // In case of api failure on vercel, getting the locally available data
    this.http.get<any>('http://localhost:3000/products').subscribe(
      (data) => {
        this.products = data;
        this.searchQuerySubject.next('');
      },
      (error) => {
        // If error in API , fetch Data locally
        if (error) {
          this.products = PRODUCT_DETAILS.products;
        }
      }
    );
  }

  updateSearchQuery(query: string) {
    this.searchQuerySubject.next(query);
  }

  updateCurrentPage(page: number) {
    this.currentPageSubject.next(page);
  }
  // API call
  private filterProducts(query: string): Product[] {
    query = query.toLowerCase();
    return this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
  }

  getProducts(): Product[] {
    return this.products;
  }
}
