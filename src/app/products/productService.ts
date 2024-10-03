import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';  // Importamos o 'tap' para emitir o evento e o 'catchError' para tratamento de erros

export interface Product {
  id: number;
  name: string;
  quantity: number;
  numberlote: string;
  type: string;
  expiryDate: Date;
  unitPrice: number;
  priceforlote: number;
  description: string;
  showActions?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';

  // Subject para emitir eventos de atualização da lista de produtos
  private productListUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  // Método para obter produtos da API
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)  // Adiciona o tratamento de erros
      );
  }

  // Método para salvar um novo produto
  saveProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(
        tap(() => this.refreshProductList()),  // Emite o evento de atualização
        catchError(this.handleError)
      );
  }

  // Método para deletar um produto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => this.refreshProductList()),  // Emite o evento de atualização
        catchError(this.handleError)
      );
  }

  // Método para atualizar um produto
  updateProduct(updatedProduct: Product, productId: number): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, updatedProduct)
      .pipe(
        tap(() => this.refreshProductList()),  // Emite o evento de atualização
        catchError(this.handleError)
      );
  }

  // Emite o evento para informar que a lista de produtos foi atualizada
  refreshProductList(): void {
    this.productListUpdated.next();  // Emite o evento de atualização
  }

  // Inscreve-se nas atualizações da lista de produtos
  onProductListUpdated(): Observable<void> {
    return this.productListUpdated.asObservable();
  }

  // Função para tratamento de erros
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      // Erro no lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro no lado do servidor
      errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));  // Lança o erro
  }
}
