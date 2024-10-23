import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Para o diálogo
import { Product, ProductService } from "../../products/productService";
import { Promotion, PromotionService } from "../promotionService";
import { OrganizePromotionsDialogComponent } from './organize-promotions/organize-promotions.component';
import {RouterLink} from "@angular/router"; // O diálogo de organização de promoções

@Component({
  selector: 'app-promotion-page',
  standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule, MatDialogModule, RouterLink],
  templateUrl: './promotion-page.component.html',
  styleUrls: ['./promotion-page.component.scss']
})
export class PromotionPageComponent implements OnInit {
  products: Product[] = [];
  productsWithPromotion: Product[] = [];
  productsWithoutPromotion: Product[] = [];
  promotions: Promotion[] = [];  // Lista de promoções
  selectedProduct?: Product;
  loading: boolean = false;


  constructor(
    private productService: ProductService,
    private promotionService: PromotionService,
    public dialog: MatDialog // Para abrir o diálogo
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadPromotions(); // Carregar as promoções também
  }

  // Carregar lista de produtos e separar entre com e sem promoção
  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.productsWithPromotion = products.filter(p => p.promotion);
      this.productsWithoutPromotion = products.filter(p => !p.promotion);
      this.loading = false;
    });
  }

  // Carregar promoções do backend
  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe(promotions => {
      this.promotions = promotions;
    });
  }

  removePromotion(product: Product): void {
    if (confirm('Tem certeza que deseja remover a promoção?')) {
      this.loading = true;  // Ativa o estado de carregamento
      product.promotion = undefined;
      this.productService.updateProduct(product, product.productId).subscribe(() => {
        this.loadProducts(); // Atualiza a lista de produtos
      });
    }
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }

  // Abrir o diálogo de organizar promoções
  openOrganizePromotionsDialog(): void {
    const dialogRef = this.dialog.open(OrganizePromotionsDialogComponent, {
      width: '80%',  // Aumenta a largura
      height: '80%', // Define a altura máxima
      panelClass: 'custom-dialog-container', // Aplica uma classe CSS personalizada
      data: {
        products: this.products,
        promotions: this.promotions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();  // Recarrega a lista de produtos
      }
    });
  }

}
