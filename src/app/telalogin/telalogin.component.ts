import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgIf } from "@angular/common";
import { LoginService } from "./LoginService";
import {Router} from "@angular/router";

@Component({
  selector: 'app-telalogin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './telalogin.component.html',
  styleUrls: ['./telalogin.component.scss'] // Corrigido para "styleUrls" (plural)
})
export class TelaloginComponent {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode = true;  // Alternar entre login e registro
  errorMessage: string | null = null;  // Para exibir mensagens de erro

  constructor(private fb: FormBuilder, private loginService: LoginService,
  private router: Router) {}

  ngOnInit(): void {
    this.buildForms();
  }

  buildForms(): void {
    // Formulário de login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
    });

    // Formulário de registro
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
    });
  }

  // Alterna entre o modo de login e registro
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = null; // Limpa a mensagem de erro ao trocar
  }

  // Submissão do formulário de login
  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const { email, senha } = this.loginForm.value;
      this.loginService.login(email, senha).subscribe({
        next: (response) => {
          console.log('Login bem-sucedido', response);
          this.router.navigate(['/product']);
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    } else {
      console.log('Formulário de login inválido');
    }
  }

  // Submissão do formulário de registro
  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const { name, email, senha } = this.registerForm.value;
      this.loginService.register(name, email, senha).subscribe({
        next: (response) => {
          console.log('Registro bem-sucedido', response);
          this.toggleMode(); // Alterna para o login após o registro
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    } else {
      console.log('Formulário de registro inválido');
    }
  }
}
