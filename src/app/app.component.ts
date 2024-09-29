import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ProductsListComponent} from "./products/products-list/products-list.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProductsListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front';
}
