import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../products/productService';
import { FormBuilder, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ProductWithExpiration extends Product {
  daysUntilExpiration: number;  // Adiciona a propriedade daysUntilExpiration
}

@Component({
  selector: 'app-validation',
  standalone: true,
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink]
})
export class ValidationComponent implements OnInit {
  products: ProductWithExpiration[] = [];  // Usa o novo tipo com daysUntilExpiration
  filteredProducts: ProductWithExpiration[] = [];
  searchControl = new FormControl('');
  displayFields = [
    { key: 'productName', label: 'Nome do Produto', selected: true },
    { key: 'dateExpiration', label: 'Data de Validade', selected: true },
    { key: 'daysUntilExpiration', label: 'Dias Restantes', selected: true }
  ];
  errorMessage = ''; // Para armazenar a mensagem de erro

  constructor(private productService: ProductService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProducts();
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      (products: Product[]) => {
        this.products = this.calculateDaysUntilExpiration(products);
        this.sortProductsByExpiration();
        this.applyFilters();
      },
      error => this.handleError(error)
    );
  }

  // Calcula os dias restantes até a validade do produto
  calculateDaysUntilExpiration(products: Product[]): ProductWithExpiration[] {
    const currentDate: Date = new Date();
    return products.map(product => {
      if (!product.dateExpiration) {
        return { ...product, daysUntilExpiration: Infinity }; // Usando Infinity para itens sem validade
      }

      const dateExpiration = new Date(product.dateExpiration);
      const timeDiff = dateExpiration.getTime() - currentDate.getTime();
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return { ...product, daysUntilExpiration };  // Retorna o produto com 'daysUntilExpiration'
    });
  }

  // Ordena os produtos pelo número de dias restantes até expirar
  sortProductsByExpiration(): void {
    this.products.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
  }

  // Aplica o filtro de pesquisa
  applyFilters(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.filteredProducts = this.products.filter(product => {
      // Filtra os produtos com base no termo de busca
      return product.productName.toLowerCase().includes(searchTerm);
    });
  }

  // Alterna a visibilidade dos campos dinâmicos
  toggleField(fieldKey: string): void {
    const field = this.displayFields.find(f => f.key === fieldKey);
    if (field) {
      field.selected = !field.selected;
    }
  }

  // Verifica se o campo deve ser exibido
  isFieldVisible(fieldKey: keyof ProductWithExpiration): boolean {
    return !!this.displayFields.find(field => field.key === fieldKey && field.selected);
  }

  // Tratamento de erros
  handleError(error: any): void {
    this.errorMessage = 'Erro ao carregar produtos. Tente novamente mais tarde.';
    console.error('Erro ao carregar produtos:', error);
  }
}
