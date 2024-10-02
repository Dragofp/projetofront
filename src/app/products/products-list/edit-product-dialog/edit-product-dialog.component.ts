import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    ReactiveFormsModule,          // Importa ReactiveFormsModule para formulários
    MatFormFieldModule,           // Importa MatFormFieldModule para os campos do formulário
    MatInputModule,               // Importa MatInputModule para inputs
    MatButtonModule,              // Importa MatButtonModule para botões
    MatDialogActions,             // Importa MatDialogActions para ações no diálogo
    MatDialogContent              // Importa MatDialogContent para conteúdo do diálogo
  ],
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.scss']
})
export class EditProductDialogComponent implements OnInit {
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any  // Recebe os dados do produto para edição
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: [this.data.name, Validators.required],
      description: [this.data.description, Validators.required],
      priceforlote: [this.data.priceforlote, [Validators.required, Validators.min(0)]],
      quantity: [this.data.quantity, [Validators.required, Validators.min(1)]],
    });
  }

  onCancel(): void {
    this.dialogRef.close();  // Fecha o diálogo sem salvar
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);  // Retorna os dados editados
    }
  }
}
