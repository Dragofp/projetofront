import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Promotion {
  promotionId: number;
  promotionDescription: string; // Usando o campo correto da API
  discountPercentage: number;
  startDate?: Date;
  endDate?: Date;
  status?: 'ACTIVE' | 'INACTIVE';
}


@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = 'http://localhost:8080/promotions';

  private promotionListUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl,{ headers: this.getHeaders() }).pipe(
      tap((promotions) => {
        promotions.forEach(promotion => {
          promotion.startDate = promotion.startDate ? new Date(promotion.startDate) : undefined;
          promotion.endDate = promotion.endDate ? new Date(promotion.endDate) : undefined;
        });
      }),
      catchError(this.handleError)
    );
  }

  savePromotion(promotion: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, promotion,{ headers: this.getHeaders() }).pipe(
      tap(() => this.refreshPromotionList()),
      catchError(this.handleError)
    );
  }

  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`,{ headers: this.getHeaders() }).pipe(
      tap(() => this.refreshPromotionList()),
      catchError(this.handleError)
    );
  }

  updatePromotion(updatedPromotion: Promotion, promotionId: number): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiUrl}/${promotionId}`, updatedPromotion,{ headers: this.getHeaders() }).pipe(
      tap(() => this.refreshPromotionList()),
      catchError(this.handleError)
    );
  }

  refreshPromotionList(): void {
    this.promotionListUpdated.next();
  }

  onPromotionListUpdated(): Observable<void> {
    return this.promotionListUpdated.asObservable();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}\nMensagem: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

