import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Adiciona CommonModule
import { RouterOutlet } from '@angular/router';
import { ProductListComponent } from './products/products-list/products-list.component';  // Importa o ProductListComponent
import { ProductFormComponent } from './products/product-form/product-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";  // Corrige a importação para MatDialogModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,  // Use CommonModule, não BrowserModule
    RouterOutlet,
    ProductListComponent,
    ProductFormComponent,
    MatDialogModule,  // Importa o MatDialogModule para permitir diálogos
  ],
  providers:[BrowserAnimationsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
