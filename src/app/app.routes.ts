import {RouterModule, Routes} from '@angular/router';
import { ValidationComponent } from './validation/validation.component';
import {NgModule} from "@angular/core";
import {ProductListComponent} from "./products/products-list/products-list.component";
import {PromotionPageComponent} from "./promotions/promotion-page/promotion-page.component";
import {TelaloginComponent} from "./telalogin/telalogin.component";
import {RelatorioComponent} from "./relatorio/relatorio.component";

export const routes: Routes = [
  { path: '', component: TelaloginComponent },          // Rota principal (raiz)
  { path: 'validation', component: ValidationComponent }, // Rota para o ValidationComponent
  {path: 'promotion', component: PromotionPageComponent},
  {path: 'product', component: ProductListComponent},
  {path: 'report', component:RelatorioComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Configure o RouterModule aqui
  exports: [RouterModule]
})
export class AppRoutingModule { }
