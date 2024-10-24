import { Component, Output, EventEmitter } from '@angular/core';
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
  imports: [
    RouterLink
  ],
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() toggleSearchEvent = new EventEmitter<void>();
  @Output() openAddDialogEvent = new EventEmitter<void>();
  userName: string | null = '';

  constructor( private router: Router) {
  }

  ngOnInit() {
    this.userName = sessionStorage.getItem('username');
  }

  logout(): void {
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('username');
    this.router.navigate(['/']);
  }

  // Emite o evento para alternar a barra de pesquisa
  toggleSearch(): void {
    this.toggleSearchEvent.emit();
  }

  // Emite o evento para abrir o diálogo de adicionar produto
  openAddDialog(): void {
    this.openAddDialogEvent.emit();
  }



}
