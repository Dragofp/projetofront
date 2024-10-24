import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

class LoginResponse {
  email!: string;
  password!: string;
  token!: string;
  name!: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8080/auth'; // URL do seu backend

  constructor(private httpClient: HttpClient) {}

  // Método de login
  login(email: string, password: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(this.apiUrl + "/login", { email, password }).pipe(
      tap((value) => {
        sessionStorage.setItem("auth-token", value.token);  // Armazena o token
        sessionStorage.setItem("username", value.name);    // Armazena o nome do usuário
      }),
      catchError(this.handleError)
    );
  }

  // Método de registro
  register(name: string, email: string, password: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(this.apiUrl + "/register", { name, email, password }).pipe(
      tap((value) => {
        sessionStorage.setItem("auth-token", value.token);  // Armazena o token
        sessionStorage.setItem("username", value.name);    // Armazena o nome do usuário
      }),
      catchError(this.handleError)
    );
  }

  // Tratamento de erros personalizados
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.status === 401) {
      errorMessage = 'Credenciais inválidas. Verifique e tente novamente.';
    } else if (error.status === 400) {
      errorMessage = 'Erro no envio dos dados. Verifique os campos e tente novamente.';
    } else if (error.status === 0) {
      errorMessage = 'O servidor não está respondendo. Tente mais tarde.';
    }
    return throwError(() => new Error(errorMessage));
  }
}