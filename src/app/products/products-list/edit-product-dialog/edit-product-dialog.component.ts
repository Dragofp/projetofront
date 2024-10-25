import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { Product, ProductService, Promotion } from '../../productService';
import { PromotionService } from '../../../promotions/promotionService';

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  templateUrl: './edit-product-dialog.component.html',
  imports: [DecimalPipe, ReactiveFormsModule, NgIf, NgForOf],
  styleUrls: ['./edit-product-dialog.component.scss'],
})
export class EditProductDialogComponent implements OnInit {
  productForm!: FormGroup;
  promotions: Promotion[] = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private productService: ProductService,
    private promotionService: PromotionService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPromotions();
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      productName: [this.data.productName, Validators.required],
      productType: [this.data.productType],
      quantity: [this.data.quantity, [Validators.required, Validators.min(1)]],
      numberLote: [this.data.numberLote, Validators.required],
      description: [this.data.description],
      dateExpiration: [
        this.formatDateForInput(this.data.dateExpiration),
        Validators.required,
      ],
      priceForLote: [this.data.priceForLote, [Validators.required, Validators.min(0)]],
      gainPercentage: [this.data.gainPercentage, [Validators.required, Validators.min(0)]],
      status: [this.data.status, Validators.required],
      promotion: [this.data.promotion?.promotionId || null], // Aceita promoção como null
    });
  }

  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe({
      next: (promotions) => (this.promotions = promotions),
      error: (error) => {
        console.error('Erro ao carregar promoções:', error);
        this.errorMessage = 'Erro ao carregar promoções.';
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      const productId = this.data.productId;
      const payload: Product = {
        ...this.productForm.value,
        productId: productId,
        promotion: this.productForm.value.promotion
          ? { promotionId: this.productForm.value.promotion }
          : null,
      };

      this.productService.updateProduct(payload, productId).subscribe({
        next: () => this.dialogRef.close(true),
        error: (error) => {
          this.errorMessage = `Erro ao atualizar produto: ${error.message}`;
          console.error('Erro de atualização:', error);
        },
      });
    }
  }

  formatDateForInput(date: string | Date | undefined): string {
    if (!date) return '';
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = ('0' + (parsedDate.getMonth() + 1)).slice(-2);
    const day = ('0' + parsedDate.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
}
