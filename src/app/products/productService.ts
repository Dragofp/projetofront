import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Promotion {
  promotionId: number;
  promotionDescription?: string;  // Renomeie de 'description' para 'promotionDescription'
  discountPercentage: number;
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
  dateExpiration?: Date;
  gainPercentage: number;
  priceForLote: number;             // Preço base do lote
  priceForLotePercent?: number;     // Preço do lote com ganho
  priceForUnity?: number;           // Preço unitário base
  priceForUnityPercent?: number;    // Preço unitário com ganho
  createdAt?: Date;
  updatedAt?: Date;
  status: 'ACTIVE' | 'SOLD' | 'ROTTEN';
  promotion?: Promotion;
  showActions?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';

  private productListUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap((products) => {
        console.log('Produtos recebidos:', products);  // Verifica os produtos recebidos
        products.forEach(product => {
          // Conversão de datas
          product.dateExpiration = product.dateExpiration ? new Date(product.dateExpiration) : undefined;
          product.createdAt = product.createdAt ? new Date(product.createdAt) : undefined;
          product.updatedAt = product.updatedAt ? new Date(product.updatedAt) : undefined;

          // Conversão de datas da promoção
          if (product.promotion) {
            product.promotion.startDate = product.promotion.startDate ? new Date(product.promotion.startDate) : undefined;
            product.promotion.endDate = product.promotion.endDate ? new Date(product.promotion.endDate) : undefined;
          }

          // Calcula os preços com base no ganho
          this.calculatePrices(product);
        });
      }),
      catchError(this.handleError)
    );
  }

  // Função para salvar um novo produto
  saveProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(() => this.refreshProductList()),
      catchError(this.handleError)
    );
  }

  // Função para deletar um produto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshProductList()),
      catchError(this.handleError)
    );
  }

  // Função para atualizar um produto
  updateProduct(updatedProduct: Product, productId: number): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, updatedProduct).pipe(
      tap(() => this.refreshProductList()),
      catchError(this.handleError)
    );
  }

  // Função para calcular os preços com base na porcentagem de ganho
  calculatePrices(product: Product): Product {
    const gainMultiplier = 1 + (product.gainPercentage / 100);

    // Preço total com o ganho aplicado
    product.priceForLotePercent = product.priceForLote * gainMultiplier;

    // Preço unitário base
    product.priceForUnity = product.priceForLote / product.quantity;

    // Preço unitário com o ganho aplicado
    product.priceForUnityPercent = product.priceForLotePercent / product.quantity;

    return product;
  }

  // Função para calcular os preços com base na promoção
  calculatePricesWithPromotion(product: Product): Product {
    if (product.promotion && product.promotion.status === 'ACTIVE') {
      const discount = product.promotion.discountPercentage / 100;

      // Certifique-se de que o preço com ganho já esteja calculado
      if (product.priceForLotePercent !== undefined && product.quantity > 0) {
        const priceForLoteWithPromotion = product.priceForLotePercent * (1 - discount);
        const priceForUnityWithPromotion = priceForLoteWithPromotion / product.quantity;

        // Atualiza os preços com a promoção aplicada
        product.priceForLotePercent = priceForLoteWithPromotion;
        product.priceForUnityPercent = priceForUnityWithPromotion;
      }
    }
    return product;
  }


  // Função para aplicar promoções a uma lista de produtos
  applyPromotionsToProducts(products: Product[]): Product[] {
    return products.map(product => this.calculatePricesWithPromotion(product));
  }

  refreshProductList(): void {
    this.productListUpdated.next();
  }

  onProductListUpdated(): Observable<void> {
    return this.productListUpdated.asObservable();
  }

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
