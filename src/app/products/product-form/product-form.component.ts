import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductService, Product } from '../productService'; // Certifique-se de que o caminho está correto

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Adiciona CommonModule e ReactiveFormsModule aos imports
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;

  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      numberlote: ['', Validators.required],
      type: ['', Validators.required],
      expiryDate: ['', Validators.required],
      unitPrice: [0.0, [Validators.required, Validators.min(0)]],
      priceforlote: [0.0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      // Converte os dados do formulário em um novo objeto Product
      const newProduct: Product = {
        ...this.productForm.value,
        expiryDate: new Date(this.productForm.value.expiryDate) // Converte a string para Date
      };

      // Chama o serviço para cadastrar o produto
      this.productService.saveProduct(newProduct).subscribe({
        next: (response) => {
          console.log('Produto cadastrado com sucesso!', response);

          // Após o cadastro, atualiza a lista de produtos
          this.productService.refreshProductList();  // Atualiza a lista de produtos

          // Resetar o formulário após sucesso
          this.productForm.reset();
        },
        error: (error) => {
          console.error('Erro ao cadastrar produto!', error);
        }
      });
    } else {
      console.log('Formulário inválido');
    }
  }
}
