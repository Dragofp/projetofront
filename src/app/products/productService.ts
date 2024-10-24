import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Product {
  productId: number;
  productName: string;
  productType: string;
  quantity: number;
  numberLote: string;
  description: string;
  dateExpiration?: Date;
  gainPercentage: number;
  priceForLote: number;
  priceForLotePercent?: number;
  priceForUnity?: number;
  priceForUnityPercent?: number;
  createdAt?: Date;
  updatedAt?: Date;
  status: 'ACTIVE' | 'SOLD' | 'ROTTEN';
  showActions?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://app-long-surf-313.fly.dev/products'; // Atualize com a URL do seu backend

  // Subject para emitir eventos de atualização da lista de produtos
  private productListUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  // Método para obter produtos da API com conversão de datas
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap((products) => {
        products.forEach(product => {
          product.dateExpiration = product.dateExpiration ? new Date(product.dateExpiration) : undefined;
          product.createdAt = product.createdAt ? new Date(product.createdAt) : undefined;
          product.updatedAt = product.updatedAt ? new Date(product.updatedAt) : undefined;
        });
      }),
      catchError(this.handleError)
    );
  }

  // Método para salvar um novo produto
  saveProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(() => this.refreshProductList()),
      catchError(this.handleError)
    );
  }

  // Método para deletar um produto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshProductList()),
      catchError(this.handleError)
    );
  }

  // Método para atualizar um produto
  updateProduct(updatedProduct: Product, productId: number): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, updatedProduct).pipe(
      tap(() => this.refreshProductList()),
      catchError(this.handleError)
    );
  }

  // Emite o evento para informar que a lista de produtos foi atualizada
  refreshProductList(): void {
    this.productListUpdated.next();
  }

  // Inscreve-se nas atualizações da lista de produtos
  onProductListUpdated(): Observable<void> {
    return this.productListUpdated.asObservable();
  }

  // Função para tratamento de erros
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
