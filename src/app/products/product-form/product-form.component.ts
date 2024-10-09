import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService, Product } from '../productService';
import { MatDialogRef } from '@angular/material/dialog';
import { DecimalPipe } from "@angular/common";

@Component({
  selector: 'app-product-form',
  standalone: true,
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  imports: [ReactiveFormsModule, DecimalPipe]
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  priceForUnity = 0.0;
  priceForLotePercent = 0.0;
  priceForUnityPercent = 0.0;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductFormComponent>
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      numberLote: ['', Validators.required],
      productType: ['', Validators.required],
      dateExpiration: ['', Validators.required],
      priceForLote: [0.0, [Validators.required, Validators.min(0)]],
      gainPercentage: [0.0, [Validators.required, Validators.min(0)]],
      description: ['']
    });

    this.productForm.valueChanges.subscribe(() => this.calculatePrices());
  }

  calculatePrices(): void {
    const { quantity, priceForLote, gainPercentage } = this.productForm.value;

    if (quantity > 0 && priceForLote >= 0 && gainPercentage >= 0) {
      this.priceForUnity = priceForLote / quantity;
      this.priceForLotePercent = priceForLote * (1 + gainPercentage / 100);
      this.priceForUnityPercent = this.priceForLotePercent / quantity;
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Product = {
        ...this.productForm.value,
        dateExpiration: this.productForm.value.dateExpiration,
        status: 'ACTIVE'
      };

      this.productService.saveProduct(newProduct).subscribe({
        next: () => {
          this.productService.refreshProductList();
          this.dialogRef.close(true);
        },
        error: (error) => console.error('Erro ao cadastrar produto!', error)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
