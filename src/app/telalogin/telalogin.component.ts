import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { LoginService } from './LoginService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-telalogin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './telalogin.component.html',
  styleUrls: ['./telalogin.component.scss']
})
export class TelaloginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode = true;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router) {}

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

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = null; // Limpa a mensagem de erro ao trocar
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const { email, senha } = this.loginForm.value;
      this.loginService.login(email, senha).subscribe({
        next: () => {
          console.log('Login bem-sucedido');
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

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const { name, email, senha } = this.registerForm.value;
      this.loginService.register(name, email, senha).subscribe({
        next: () => {
          console.log('Registro bem-sucedido');
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
