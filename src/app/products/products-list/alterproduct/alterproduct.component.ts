import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Product } from "../../productService";

@Component({
  selector: 'app-alterproduct',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './alterproduct.component.html',
  styleUrls: ['./alterproduct.component.scss']
})
export class AlterProductComponent implements OnInit {
  alterForm!: FormGroup;
  initialQuantity: number = 0;
  finalQuantity: number = 0;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AlterProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product
  ) {
    this.initialQuantity = data.quantity;
    this.finalQuantity = this.initialQuantity; // Define o valor inicial da quantidade final
  }

  ngOnInit(): void {
    this.alterForm = this.fb.group({
      changeQuantity: [0, [Validators.required]],
      finalQuantity: [{ value: this.initialQuantity, disabled: true }] // Campo apenas para visualização
    });

    this.alterForm.get('changeQuantity')!.valueChanges.subscribe(change => {
      this.updateFinalQuantity(change);
    });
  }

  updateFinalQuantity(change: number): void {
    const newQuantity = this.initialQuantity + change;
    this.finalQuantity = newQuantity < 1 ? 1 : newQuantity; // Garante que não fique abaixo de 1
    this.alterForm.get('finalQuantity')!.setValue(this.finalQuantity);
  }

  adjustQuantity(amount: number): void {
    const currentChange = this.alterForm.get('changeQuantity')!.value || 0;
    this.alterForm.get('changeQuantity')!.setValue(currentChange + amount);
  }

  onSave(): void {
    if (this.finalQuantity > 0) {
      const updatedProduct = { ...this.data, quantity: this.finalQuantity };
      this.dialogRef.close(updatedProduct);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
