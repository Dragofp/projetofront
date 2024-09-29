import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Adiciona CommonModule
import { RouterOutlet } from '@angular/router';
import { ProductListComponent } from './products/products-list/products-list.component';  // Importa o ProductListComponent
import { ProductFormComponent } from './products/product-form/product-form.component';  // Importa o ProductFormComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProductListComponent, ProductFormComponent],  // Importa os componentes
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
