import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../productService';
import { PromotionService, Promotion } from '../../promotions/promotionService';  // Importa PromotionService
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EditProductDialogComponent } from './edit-product-dialog/edit-product-dialog.component';
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { ProductFormComponent } from "../product-form/product-form.component";
import { AlterProductComponent } from "./alterproduct/alterproduct.component";

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  imports: [CommonModule, MatDialogModule, ToolbarComponent, ReactiveFormsModule, FormsModule]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  currentPage: number = 1;
  productsPerPage: number = 6;
  showSearchBar: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  sortCriteria: string = 'productName'; // Critério de ordenação padrão
  sortDirection: string = 'asc'; // Direção padrão: 'asc' (ascendente)

  // Filtros dinâmicos
  filters: { searchField: FormControl; searchTerm: FormControl }[] = [];

  // Campos exibíveis na lista de produtos
  displayFields = [
    { key: 'productId', label: 'ID', selected: true },
    { key: 'description', label: 'Descrição', selected: true },
    { key: 'productType', label: 'Tipo', selected: true },
    { key: 'numberLote', label: 'Número do Lote', selected: true },
    { key: 'dateExpiration', label: 'Data de Validade', selected: true },
    { key: 'priceForUnity', label: 'Preço Unitário', selected: true },
    { key: 'priceForUnityPercent', label: 'Preço Unitário com Ganho', selected: true },
    { key: 'priceForLote', label: 'Preço por Lote', selected: true },
    { key: 'priceForLotePercent', label: 'Preço por Lote com Ganho', selected: true },
    { key: 'gainPercentage', label: 'Porcentagem de Ganho', selected: true },
    { key: 'quantity', label: 'Quantidade por Lote', selected: true },
    { key: 'promotion', label: 'Promoção Ativa', selected: true } // Campo de Promoção Ativa
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private promotionService: PromotionService, // Adiciona PromotionService
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.addFilter();

    this.productService.onProductListUpdated().subscribe(() => {
      this.loadProducts();
    });
  }

  // ========= Filtros Dinâmicos =========
  addFilter(): void {
    const newFilter = {
      searchField: new FormControl('productName'),
      searchTerm: new FormControl('')
    };
    this.filters.push(newFilter);
    this.observeFilterChanges(newFilter);
  }

  observeFilterChanges(filter: { searchField: FormControl, searchTerm: FormControl }): void {
    filter.searchField.valueChanges.subscribe(() => this.applyFilters());
    filter.searchTerm.valueChanges.subscribe(() => this.applyFilters());
  }

  removeFilter(index: number): void {
    this.filters.splice(index, 1);
    this.applyFilters();
  }

  applyFilters(): void {
    // Aplica os filtros na lista de produtos
    this.filteredProducts = this.products.filter(product => {
      return this.filters.every(filter => {
        const searchField = filter.searchField.value as keyof Product;
        const searchTerm = filter.searchTerm.value.toLowerCase();

        // Obtem o valor do campo de pesquisa e converte para string, lidando com campos não definidos
        const fieldValue = product[searchField]?.toString().toLowerCase() || '';

        // Retorna true se o campo contém o termo de busca
        return fieldValue.includes(searchTerm);
      });
    });

    // Atualiza os produtos paginados com a nova lista filtrada
    this.updatePaginatedProducts();
  }

  // ========= Ordenação =========
  sortProducts(): void {
    this.filteredProducts.sort((a: Product, b: Product) => {
      const valueA = a[this.sortCriteria as keyof Product];
      const valueB = b[this.sortCriteria as keyof Product];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      if (valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }

      return 0; // Caso os valores não sejam comparáveis diretamente
    });

    this.updatePaginatedProducts(); // Atualiza a lista paginada após a ordenação
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortProducts(); // Reordena os produtos após mudar a direção
  }

  // ========= Manipulação de Produtos e Promoções =========
  loadProducts(): void {
    this.loading = true;

    // Função utilitária para converter strings ou Date em objetos Date
    const convertDate = (dateInput: string | Date | null | undefined): Date | undefined => {
      // Se já for um Date, retorna diretamente
      if (dateInput instanceof Date) {
        return dateInput;
      }
      // Converte strings para Date, se aplicável
      return dateInput ? new Date(dateInput) : undefined;
    };

    this.productService.getProducts().subscribe(
      (products: Product[]) => {
        this.products = products.map(product => {
          product.showActions = false;

          // Converte as datas do produto, se necessário
          product.dateExpiration = convertDate(product.dateExpiration);
          product.createdAt = convertDate(product.createdAt);
          product.updatedAt = convertDate(product.updatedAt);

          // Verifica e processa a promoção, se existir
          if (product.promotion) {
            // Converte as datas da promoção
            product.promotion.startDate = convertDate(product.promotion.startDate);
            product.promotion.endDate = convertDate(product.promotion.endDate);

            // Define uma descrição padrão para a promoção, se estiver ausente
            product.promotion.promotionDescription = product.promotion.promotionDescription || 'Sem descrição';
          }

          return product;
        });

        // Aplica filtros após carregar os produtos
        this.applyFilters();
        this.loading = false;
      },
      error => this.handleError(error)
    );
  }

  updateProduct(updatedProduct: Product, productId: number): void {
    this.productService.updateProduct(updatedProduct,productId).subscribe(
      () => this.loadProducts(),
      error => this.handleError(error)
    );
  }

  // Ações de CRUD para Produtos
  confirmDelete(productId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteProduct(productId);
    });
  }

  deleteProduct(productId: number): void {
    this.productService.deleteProduct(productId).subscribe(
      () => this.loadProducts(),
      error => this.handleError(error)
    );
  }

  onToggleSearch(): void {
    this.showSearchBar = !this.showSearchBar;
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '95%',
      maxWidth: '650px',
      maxHeight: '100vh',
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateProduct(result, product.productId);
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '95%',
      maxWidth: '600px',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  openAlterDialog(product: Product): void {
    const dialogRef = this.dialog.open(AlterProductComponent, {
      width: '700px',
      panelClass: 'custom-dialog-container',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { showActions, ...productData } = result;
        this.updateProduct(productData, product.productId);
      }
    });
  }

  // ========= Paginação =========
  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.productsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.productsPerPage);
  }

  toggleAllFields(): void {
    const allSelected = this.displayFields.every(field => field.selected);
    this.displayFields.forEach(field => field.selected = !allSelected);
  }

  toggleField(fieldKey: string): void {
    const field = this.displayFields.find(f => f.key === fieldKey);
    if (field) {
      field.selected = !field.selected;
    }
  }

  isFieldVisible(fieldKey: keyof Product): boolean {
    return !!this.displayFields.find(field => field.key === fieldKey && field.selected);
  }

  // ========= Tratamento de Erros =========
  handleError(error: any): void {
    this.errorMessage = `Erro: ${error.statusText || 'Erro desconhecido'}`;
  }
}
