import { Component, Inject, OnInit } from '@angular/core';
import { Promotion, PromotionService } from "../../promotionService";
import { Product, ProductService } from "../../../products/productService";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {NgForOf, NgIf} from "@angular/common";
import {PromotionPageComponent} from "../promotion-page.component";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-organize-promotions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf,
    PromotionPageComponent
  ],
  templateUrl: './organize-promotions.component.html',
  styleUrls: ['./organize-promotions.component.scss']
})
export class OrganizePromotionsDialogComponent implements OnInit {
  selectedPromotion?: Promotion;
  selectedProducts: Product[] = [];
  promotions: Promotion[] = [];
  filterControl = new FormControl('');

  // Controle para exibir ou esconder o formulário de criação de promoção
  showCreatePromotionForm: boolean = false;

  // Modelo para criar uma nova promoção
  newPromotion: Promotion = {
    promotionId: 0,
    promotionDescription: '',  // Corrigido para "promotionDescription"
    discountPercentage: 0,
    startDate: undefined,
    endDate: undefined,
    status: 'ACTIVE'
  };

  constructor(
    public dialogRef: MatDialogRef<OrganizePromotionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: Product[] },
    private productService: ProductService,
    private promotionService: PromotionService,

  ) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  isProductSelected(product: Product): boolean {
    return this.selectedProducts.some(p => p.productId === product.productId);
  }

  toggleProductSelection(product: Product): void {
    const index = this.selectedProducts.findIndex(p => p.productId === product.productId);

    if (index > -1) {
      // Produto já está selecionado, remover da lista
      this.selectedProducts.splice(index, 1);
    } else {
      // Produto não está selecionado, adicionar à lista
      this.selectedProducts.push(product);
    }
  }

  // Carregar promoções existentes
  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe(
      (promotions) => {
        this.promotions = promotions;
      },
      (error) => {
        console.error('Erro ao carregar promoções', error);
      }
    );
  }

  // Alternar exibição do formulário de criar promoção
  toggleCreatePromotionForm(): void {
    this.showCreatePromotionForm = !this.showCreatePromotionForm;
  }

  // Função para criar uma nova promoção
  createPromotion(): void {
    const today = new Date();
    const startDate = this.newPromotion.startDate ? new Date(this.newPromotion.startDate) : null;

    if (!startDate || startDate < today) {
      alert('A data de início deve ser no presente ou no futuro.');
      return;
    }

    this.promotionService.savePromotion(this.newPromotion).subscribe((createdPromotion) => {
      this.promotions.push(createdPromotion);  // Atualiza a lista de promoções
      this.selectedPromotion = createdPromotion; // Seleciona a nova promoção automaticamente
      this.newPromotion = {                       // Limpa o formulário de criação
        promotionId: 0,
        promotionDescription: '',
        discountPercentage: 0,
        startDate: undefined,
        endDate: undefined,
        status: 'ACTIVE'
      };
      this.showCreatePromotionForm = false;       // Fecha o formulário de criação
    });
  }

  // Aplicar promoção aos produtos selecionados
  applyPromotion(): void {
    if (this.selectedPromotion && this.selectedProducts.length) {
      let updateObservables = this.selectedProducts.map(product => {
        product.promotion = this.selectedPromotion;
        return this.productService.updateProduct(product, product.productId);
      });

      // Executa todas as atualizações e aguarda a conclusão
      forkJoin(updateObservables).subscribe(() => {
        this.dialogRef.close(true);  // Fecha o diálogo e retorna 'true' após todas as atualizações
      });
    }
  }



  // Cancela a ação e fecha o diálogo
  cancel(): void {
    this.dialogRef.close();
  }

  // Função para filtrar produtos com base no nome do produto
  filterProducts(): Product[] {
    const filter = this.filterControl.value?.toLowerCase() || '';
    return this.data.products.filter(product => product.productName.toLowerCase().includes(filter));
  }
}
