import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../products/productService';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ProductWithExpiration extends Product {
  daysUntilExpiration: number;
}

@Component({
  selector: 'app-validation',
  standalone: true,
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink]
})
export class ValidationComponent implements OnInit {
  products: ProductWithExpiration[] = [];
  filteredProducts: ProductWithExpiration[] = [];
  paginatedProducts: ProductWithExpiration[] = [];
  searchControl = new FormControl('');
  displayFields = [
    { key: 'productName', label: 'Nome do Produto', selected: true },
    { key: 'dateExpiration', label: 'Data de Validade', selected: true },
    { key: 'daysUntilExpiration', label: 'Dias Restantes', selected: true },
  ];
  selectedSort = 'name';
  selectedStatusFilter = '';
  currentPage = 1;
  productsPerPage = 5;
  totalPages = 1;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      (products: Product[]) => {
        this.products = this.calculateDaysUntilExpiration(products);
        this.applyFilters();  // Carrega e aplica filtros iniciais
      },
      error => this.handleError(error)
    );
  }

  calculateDaysUntilExpiration(products: Product[]): ProductWithExpiration[] {
    const currentDate: Date = new Date();
    return products.map(product => {
      if (!product.dateExpiration) return { ...product, daysUntilExpiration: Infinity };
      const dateExpiration = new Date(product.dateExpiration);
      const timeDiff = dateExpiration.getTime() - currentDate.getTime();
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return { ...product, daysUntilExpiration };
    });
  }

  applyFilters(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    let filtered = this.products.filter(product =>
      product.productName.toLowerCase().includes(searchTerm)
    );

    if (this.selectedStatusFilter) {
      filtered = filtered.filter(product => product.status === this.selectedStatusFilter);
    }

    switch (this.selectedSort) {
      case 'name':
        filtered = filtered.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'expiration':
        filtered = filtered.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
        break;
      default:
        break;
    }

    this.filteredProducts = filtered;
    this.totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
    this.currentPage = 1;
    this.updatePaginatedProducts();
  }

  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.productsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedProducts();
    }
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.selectedStatusFilter = '';
    this.selectedSort = 'name';
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleField(fieldKey: string): void {
    const field = this.displayFields.find(f => f.key === fieldKey);
    if (field) field.selected = !field.selected;
  }

  isFieldVisible(fieldKey: keyof ProductWithExpiration): boolean {
    return !!this.displayFields.find(field => field.key === fieldKey && field.selected);
  }

  handleError(error: any): void {
    console.error('Erro ao carregar produtos:', error);
  }
}
