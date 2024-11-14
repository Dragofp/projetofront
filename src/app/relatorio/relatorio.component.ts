import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Product, ProductService} from "../products/productService";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    RouterLink
  ],
  templateUrl: './relatorio.component.html',
  styleUrl: './relatorio.component.scss'
})
export class RelatorioComponent {
  criticalStockForm!: FormGroup;
  criticalStockProducts: Product[] = [];
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void {
    this.criticalStockForm = this.fb.group({
      threshold: [10] // Valor inicial do limite de estoque crítico
    });
  }

  generateReport(): void {
    const threshold = this.criticalStockForm.value.threshold;
    this.productService.getCriticalStockProducts(threshold).subscribe(
      (products) => {
        this.criticalStockProducts = products;
        if (this.criticalStockProducts.length === 0) {
          this.errorMessage = `Não há produtos abaixo do estoque mínimo de ${threshold}.`;
        } else {
          this.errorMessage = ''; // Limpa a mensagem de erro se houver produtos
        }
      },
      (error) => {
        this.errorMessage = 'Erro ao gerar relatório de estoque crítico';
        console.error(error);
      }
    );
  }}
