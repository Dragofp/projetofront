import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  saveProduct(product: Product){
    return this.http.post<Product>(this.apiUrl, product);
  }
}
