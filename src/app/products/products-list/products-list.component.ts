import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../productService';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EditProductDialogComponent } from './edit-product-dialog/edit-product-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];  // Todos os produtos
  filteredProducts: Product[] = [];  // Produtos filtrados
  paginatedProducts: Product[] = [];  // Produtos paginados
  currentPage: number = 1;
  productsPerPage: number = 3;
  searchForm!: FormGroup;

  // Propriedade para controlar a exibição da barra de pesquisa
  showSearchBar: boolean = false;  // Adicionada para controlar a visibilidade da barra de pesquisa

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
      this.loadProducts();  // Recarrega os produtos quando necessário
    });
  }

  // Inicializa o formulário de busca
  initializeForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    // Filtra produtos a cada mudança no campo de busca
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(searchTerm => {
      this.filterProducts(searchTerm);  // Atualiza produtos dinamicamente
    });
  }

  // Função para alternar a exibição da barra de pesquisa
  toggleSearch(): void {
    this.showSearchBar = !this.showSearchBar;  // Alterna entre true e false
  }

  // Carrega os produtos e atualiza a lista paginada
  loadProducts(): void {
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.products = products.map(product => ({ ...product, showActions: false }));
      this.filterProducts(this.searchForm.get('searchTerm')?.value || ''); // Garante que a filtragem inicial seja aplicada
    });
  }

  // Função de filtragem de produtos
  filterProducts(searchTerm: string): void {
    if (searchTerm) {
      this.filteredProducts = this.products.filter(product =>
        Object.values(product).some(value => {
          // Verifica se o valor não é nulo ou indefinido antes de usar toString()
          return value !== null && value !== undefined && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    } else {
      this.filteredProducts = this.products;  // Mostra todos os produtos se o campo de busca estiver vazio
    }
    this.updatePaginatedProducts();  // Atualiza a lista paginada
  }


  // Atualiza a lista de produtos paginada
  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.productsPerPage);
  }

  // Muda para a página específica
  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  // Retorna o número total de páginas
  totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.productsPerPage);
  }

  // Abre o diálogo de confirmação de exclusão
  confirmDelete(productId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteProduct(productId);
    });
  }

  // Deleta o produto e atualiza a lista
  deleteProduct(productId: number): void {
    this.productService.deleteProduct(productId).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error(`Erro ao deletar o produto com ID ${productId}`, err)
    });
  }

  // Abre o diálogo de edição de produto
  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '400px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.updateProduct(result, product.id);
    });
  }

  // Atualiza o produto e recarrega a lista
  updateProduct(updatedProduct: Product, productId: number): void {
    this.productService.updateProduct(updatedProduct, productId).subscribe(() => {
      this.loadProducts();
    });
  }
}
