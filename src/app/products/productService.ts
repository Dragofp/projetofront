import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Promotion {
  promotionId: number;
  promotionDescription?: string;
  discountPercentage?: number;
  startDate?: Date;
  endDate?: Date;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  productId: number;
  productName: string;
  productType: string;
  quantity: number;
  numberLote: string;
  description: string;
  dateExpiration?: string | Date;  // Corrigido para aceitar ambos
  gainPercentage: number;
  priceForLote: number;
  priceForLotePercent?: number;
  priceForUnity?: number;
  priceForUnityPercent?: number;
  createdAt?: Date;
  updatedAt?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'ROTTEN';
  promotion?: Promotion;
  showActions?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';
  private productListUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // ========= Funções CRUD =========

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap((products) => {
        console.log('Produtos recebidos:', products);
        this.convertDates(products);
      }),
      catchError(this.handleError)
    );
  }

  saveProduct(product: Product): Observable<Product> {
    this.formatDate(product);
    return this.http.post<Product>(this.apiUrl, product,{ headers: this.getHeaders() }).pipe(
      tap(() => this.refreshProductList()),
      catchError(this.handleError)
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`,{ headers: this.getHeaders() }).pipe(
      tap(() => this.refreshProductList()),
      catchError(this.handleError)
    );
  }

  updateProduct(product: Product, productId: number): Observable<Product> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.formatDate(product);
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, product,{ headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ========= Funções de Utilidade =========

  private convertDates(products: Product[]): void {
    products.forEach((product) => {
      if (typeof product.dateExpiration === 'string') {
        product.dateExpiration = new Date(product.dateExpiration);
      }
      if (product.promotion) {
        product.promotion.startDate = product.promotion.startDate
          ? new Date(product.promotion.startDate)
          : undefined;
        product.promotion.endDate = product.promotion.endDate
          ? new Date(product.promotion.endDate)
          : undefined;
      }
    });
  }

  private formatDate(product: Product): void {
    if (product.dateExpiration instanceof Date) {
      product.dateExpiration = product.dateExpiration.toISOString().split('T')[0];
    }
  }

  refreshProductList(): void {
    this.productListUpdated.next();
  }

  onProductListUpdated(): Observable<void> {
    return this.productListUpdated.asObservable();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error instanceof ErrorEvent
      ? `Erro: ${error.error.message}`
      : `Código do erro: ${error.status}\nMensagem: ${error.message}`;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
