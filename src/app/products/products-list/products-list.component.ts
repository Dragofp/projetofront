import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../product.service';
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  imports: [CommonModule]
})
export class ProductsListComponent implements OnInit {
  products: Product[] = []; // Inicializando como array vazio

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
      },
      (error) => {
        console.error('Erro ao buscar produtos', error);
        this.products = []; // Caso o GET falhe, ainda garantimos que a lista esteja vazia
      }
    );
  }
}
