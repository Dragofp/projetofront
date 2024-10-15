import {RouterModule, Routes} from '@angular/router';
import { ValidationComponent } from './validation/validation.component';
import {NgModule} from "@angular/core";
import {ProductListComponent} from "./products/products-list/products-list.component";
import {PromotionPageComponent} from "./promotions/promotion-page/promotion-page.component";

export const routes: Routes = [
  { path: '', component: ProductListComponent },          // Rota principal (raiz)
  { path: 'validation', component: ValidationComponent }, // Rota para o ValidationComponent
  {path: 'promotion', component: PromotionPageComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Configure o RouterModule aqui
  exports: [RouterModule]
})
export class AppRoutingModule { }
