import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../productService';
import { CommonModule } from '@angular/common';  // Importa o CommonModule para diretivas como *ngIf e *ngFor

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  imports: [CommonModule],  // Adiciona CommonModule aos imports

})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  paginatedProducts: Product[] = [];
  currentPage: number = 1;
  productsPerPage: number = 5;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Carrega os produtos ao iniciar o componente
    this.loadProducts();

    // Escuta as atualizações de produtos e recarrega a lista
    this.productService.onProductListUpdated().subscribe(() => {
      this.loadProducts();  // Recarrega os produtos quando um novo produto for cadastrado
    });
  }

  // Função que carrega os produtos da API
  loadProducts(): void {
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.products = products;
      this.updatePaginatedProducts();
    });
  }

  // Atualiza a lista de produtos paginada
  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    this.paginatedProducts = this.products.slice(startIndex, endIndex);
  }

  // Muda para a página específica
  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  // Retorna o número total de páginas
  totalPages(): number {
    return Math.ceil(this.products.length / this.productsPerPage);
  }
}
