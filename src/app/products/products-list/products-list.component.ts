import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProductService, Product } from '../productService';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EditProductDialogComponent } from './edit-product-dialog/edit-product-dialog.component';
import {ToolbarComponent} from "../../toolbar/toolbar.component";
import {ProductFormComponent} from "../product-form/product-form.component";

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, ToolbarComponent]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  currentPage: number = 1;
  productsPerPage: number = 3;
  searchForm!: FormGroup;
  showSearchBar: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';


  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();

    // Escuta as atualizações de produtos
    this.productService.onProductListUpdated().subscribe(() => {
      this.loadProducts();
    });
  }

  // Inicializa o formulário de pesquisa
  initializeForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: ['', Validators.required]
    });

    this.searchForm.get('searchTerm')?.valueChanges.subscribe(searchTerm => {
      this.filterProducts(searchTerm);
    });
  }

  onToggleSearch(): void {
    this.showSearchBar = !this.showSearchBar;
  }

  // Carregar produtos
  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe(
      (products: Product[]) => {
        this.products = products.map(product => ({ ...product, showActions: false }));
        this.filterProducts(this.searchForm.get('searchTerm')?.value || '');
        this.loading = false;
      },
      error => {
        this.handleError(error);
        this.loading = false;
      }
    );
  }

  // Filtra produtos com base no termo de pesquisa
  filterProducts(searchTerm: string): void {
    if (searchTerm) {
      this.filteredProducts = this.products.filter(product =>
        Object.values(product).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      this.filteredProducts = this.products;
    }
    this.updatePaginatedProducts();
  }

  // Atualiza a lista de produtos paginados
  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.productsPerPage);
  }

  // Muda a página atual
  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  // Atualiza o número de itens por página
  updateItemsPerPage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.productsPerPage = +selectElement.value;
    this.updatePaginatedProducts();
  }


  // Confirmação de exclusão
  confirmDelete(productId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteProduct(productId);
    });
  }

  // Exclui um produto
  deleteProduct(productId: number): void {
    this.productService.deleteProduct(productId).subscribe(
      () => {
        this.loadProducts();
      },
      error => this.handleError(error)
    );
  }

  // Abre o diálogo de edição
  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '400px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.updateProduct(result, product.id);
    });
  }

  // Atualiza um produto
  updateProduct(updatedProduct: Product, productId: number): void {
    this.productService.updateProduct(updatedProduct, productId).subscribe(
      () => {
        this.loadProducts();
      },
      error => this.handleError(error)
    );
  }

  // Tratamento de erros
  handleError(error: any): void {
    this.errorMessage = `Erro: ${error.statusText || 'Erro desconhecido'}`;
  }

  // Calcula o número total de páginas
  totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.productsPerPage);
  }

  // Alterna a barra de pesquisa
  toggleSearch(): void {
    this.showSearchBar = !this.showSearchBar;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Atualiza a lista de produtos após o fechamento do diálogo
        this.loadProducts();
      }
    });
  }
}
