import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Promotion {
  promotionId: number;
  promotionDescription: string; // Descrição da promoção
  discountPercentage: number;
  startDate?: Date;
  endDate?: Date;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = 'http://localhost:8080/promotions'; // URL da API de promoções
  private promotionListUpdated = new Subject<void>(); // Sujeito para notificar sobre atualizações na lista

  constructor(private http: HttpClient) {}

  // Retorna os headers de autorização, incluindo o token JWT
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // Adiciona o token de autorização
    });
  }

  // ========= Funções CRUD =========

  // Busca todas as promoções
  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap((promotions) => {
        promotions.forEach(promotion => {
          // Converte as datas recebidas para objetos Date
          promotion.startDate = promotion.startDate ? new Date(promotion.startDate) : undefined;
          promotion.endDate = promotion.endDate ? new Date(promotion.endDate) : undefined;
        });
      }),
      catchError(this.handleError) // Trata erros
    );
  }

  // Salva uma nova promoção
  savePromotion(promotion: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, promotion, { headers: this.getHeaders() }).pipe(
      tap(() => this.refreshPromotionList()), // Notifica sobre atualização da lista
      catchError(this.handleError)
    );
  }

  // Deleta uma promoção pelo ID
  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.refreshPromotionList()), // Atualiza lista de promoções após deletar
      catchError(this.handleError)
    );
  }

  // Atualiza uma promoção existente
  updatePromotion(updatedPromotion: Promotion, promotionId: number): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiUrl}/${promotionId}`, updatedPromotion, { headers: this.getHeaders() }).pipe(
      tap(() => this.refreshPromotionList()), // Atualiza lista após a edição
      catchError(this.handleError)
    );
  }

  // ========= Funções de Utilidade =========

  // Notifica os assinantes quando a lista de promoções é atualizada
  refreshPromotionList(): void {
    this.promotionListUpdated.next();
  }

  // Permite que outros componentes observem as atualizações da lista de promoções
  onPromotionListUpdated(): Observable<void> {
    return this.promotionListUpdated.asObservable();
  }

  // Tratamento de erros genérico
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
    }
    console.error(errorMessage); // Log de erros para debugging
    return throwError(() => new Error(errorMessage));
  }
}
