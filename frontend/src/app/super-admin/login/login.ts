import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLock, lucideMail } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { AuthService } from '../../../shared/auth.service';

interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-super-admin-login',
  imports: [FormField, NgIcon, HlmButtonImports, HlmFieldImports, HlmInputGroupImports],
  providers: [provideIcons({ lucideMail, lucideLock })],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class SuperAdminLogin {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly credentials = signal<LoginCredentials>({ email: '', password: '' });
  protected readonly credentialsForm = form(this.credentials, (path) => {
    required(path.email, { message: 'Email is required' });
    required(path.password, { message: 'Password is required' });
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  protected async login(event: Event): Promise<void> {
    event.preventDefault();
    if (this.credentialsForm().invalid()) return;

    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      const { email, password } = this.credentials();
      await this.authService.login(email, password);
      await this.router.navigateByUrl('/super-admin/tenants');
    } catch {
      this.errorMessage.set('Invalid email or password.');
    } finally {
      this.submitting.set(false);
    }
  }
}
