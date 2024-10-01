import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../productService';
import { CommonModule } from '@angular/common';
import { Observable } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialogModule, MatDialog } from '@angular/material/dialog';  // Importa MatDialog e MatDialogModule
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';  // Importa o componente de diálogo

@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],  // Use MatDialogModule para diálogos
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  paginatedProducts: Product[] = [];
  currentPage: number = 1;
  productsPerPage: number = 3;
  productForm!: FormGroup;
  showDeleteButton = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialog: MatDialog  // Injeção de MatDialog no construtor
  ) {}

  ngOnInit(): void {
    // Carrega os produtos ao iniciar o componente
    this.loadProducts();

    // Escuta as atualizações de produtos e recarrega a lista
    this.productService.onProductListUpdated().subscribe(() => {
      this.loadProducts();  // Recarrega os produtos quando um novo produto for cadastrado
    });

    // Inicializa o formulário
    this.productForm = this.fb.group({
      type: ['', Validators.required],
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

  // Função para abrir o diálogo de confirmação
  confirmDelete(productId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);  // Abre o diálogo de confirmação

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Se confirmado, deleta o produto
        this.deleteProduct(productId);
      }
    });
  }

  // Função para deletar o produto
  deleteProduct(productId: number): void {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        console.log(`Produto com ID ${productId} deletado com sucesso!`);
        this.loadProducts();  // Atualiza a lista de produtos após deletar
      },
      error: (err) => {
        console.error(`Erro ao deletar o produto com ID ${productId}`, err);
      }
    });
  }
}
