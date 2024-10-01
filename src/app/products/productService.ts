import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';  // Certifique-se de importar Subject do RxJS

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
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';

  // Inicializa o Subject para emitir eventos de atualização da lista de produtos
  private productListUpdated = new Subject<void>();  // Corrige a inicialização

  constructor(private http: HttpClient) {}

  // Método para obter produtos da API
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Método para salvar um novo produto
  saveProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
  deleteProduct(id: number): Observable<void>  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  // Emite o evento para informar que a lista de produtos foi atualizada
  refreshProductList(): void {
    this.productListUpdated.next();  // Aqui o Subject é inicializado corretamente, então podemos chamar .next()
  }

  // Inscreve-se nas atualizações da lista de produtos
  onProductListUpdated(): Observable<void> {
    return this.productListUpdated.asObservable();
  }
}
