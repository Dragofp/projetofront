import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ProductService, Product } from '../productService';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-product-form',
  standalone: true,
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  imports: [ReactiveFormsModule]
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ProductFormComponent>
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      numberlote: ['', Validators.required],
      type: ['', Validators.required],
      expiryDate: ['', Validators.required],
      unitPrice: [0.0, [Validators.required, Validators.min(0)]],
      priceforlote: [0.0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Product = {
        ...this.productForm.value,
        expiryDate: new Date(this.productForm.value.expiryDate)
      };

      this.productService.saveProduct(newProduct).subscribe({
        next: () => {
          this.productService.refreshProductList(); // Atualiza a lista de produtos
          this.dialogRef.close(true); // Fecha o diálogo e sinaliza sucesso
        },
        error: error => console.error('Erro ao cadastrar produto!', error)
      });
    }
  }
}
