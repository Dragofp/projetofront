import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent
  ],
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.scss']
})
export class EditProductDialogComponent implements OnInit {
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      productName: [this.data.productName, Validators.required],
      quantity: [this.data.quantity, [Validators.required, Validators.min(1)]],
      numberLote: [this.data.numberLote, Validators.required],
      productType: [this.data.productType, Validators.required],
      dateExpiration: [this.formatDateForInput(this.data.dateExpiration), Validators.required],
      priceForLote: [this.data.priceForLote, [Validators.required, Validators.min(0)]],
      gainPercentage: [this.data.gainPercentage, [Validators.required, Validators.min(0)]],
      priceForLotePercent: [{ value: 0, disabled: true }],  // Campo calculado, somente leitura
      priceForUnity: [{ value: 0, disabled: true }],         // Campo calculado, somente leitura
      priceForUnityPercent: [{ value: 0, disabled: true }],  // Campo calculado, somente leitura
      description: [this.data.description]
    });

    // Calcula os valores iniciais com base nos dados recebidos
    this.calculatePrices();

    // Configura os observadores para recalcular os preços conforme as mudanças
    this.setupValueChanges();
  }

  setupValueChanges(): void {
    // Recalcula os valores quando 'priceForLote', 'gainPercentage' ou 'quantity' mudarem
    this.productForm.get('priceForLote')?.valueChanges.subscribe(() => this.calculatePrices());
    this.productForm.get('gainPercentage')?.valueChanges.subscribe(() => this.calculatePrices());
    this.productForm.get('quantity')?.valueChanges.subscribe(() => this.calculatePrices());
  }

  calculatePrices(): void {
    const quantity = this.productForm.get('quantity')?.value;
    const priceForLote = this.productForm.get('priceForLote')?.value;
    const gainPercentage = this.productForm.get('gainPercentage')?.value;

    if (quantity > 0 && priceForLote >= 0) {
      // Calcula o preço unitário
      const priceForUnity = priceForLote / quantity;

      // Calcula o preço total com ganho
      const priceForLotePercent = priceForLote * (1 + gainPercentage / 100);

      // Calcula o preço unitário com ganho
      const priceForUnityPercent = priceForLotePercent / quantity;

      // Atualiza os valores no formulário
      this.productForm.patchValue({
        priceForUnity: priceForUnity.toFixed(2),
        priceForLotePercent: priceForLotePercent.toFixed(2),
        priceForUnityPercent: priceForUnityPercent.toFixed(2)
      }, { emitEvent: false });
    }
  }

  formatDateForInput(date: string): string | null {
    if (!date) return null;
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = ('0' + (parsedDate.getMonth() + 1)).slice(-2);
    const day = ('0' + parsedDate.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      const updatedProduct = {
        ...this.productForm.value,
        id: this.data.id,
        dateExpiration: this.convertDateToBackendFormat(this.productForm.value.dateExpiration)
      };
      this.dialogRef.close(updatedProduct);
    }
  }

  convertDateToBackendFormat(date: string): string {
    return date;
  }
}
