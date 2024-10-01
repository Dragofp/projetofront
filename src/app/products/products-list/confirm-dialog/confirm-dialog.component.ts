import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';  // Corrige a importação do MatDialogModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,  // Importa o MatDialogModule corretamente
  ],
  templateUrl: 'confirm-dialog.component.html',
  styleUrls: ['confirm-dialog.component.scss'],  // Corrige o plural de styleUrls
})
export class ConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true);  // Retorna true se confirmado
  }

  onCancel(): void {
    this.dialogRef.close(false);  // Retorna false se cancelado
  }
}
