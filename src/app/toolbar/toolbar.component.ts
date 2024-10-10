import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() toggleSearchEvent = new EventEmitter<void>();
  @Output() openAddDialogEvent = new EventEmitter<void>();


  // Emite o evento para alternar a barra de pesquisa
  toggleSearch(): void {
    this.toggleSearchEvent.emit();
  }

  // Emite o evento para abrir o diálogo de adicionar produto
  openAddDialog(): void {
    this.openAddDialogEvent.emit();
  }


}
