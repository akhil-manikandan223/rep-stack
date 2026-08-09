import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLock, lucideMail } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';

@Component({
  selector: 'app-login',
  imports: [RouterLink, NgIcon, HlmButtonImports, HlmFieldImports, HlmInputGroupImports],
  providers: [provideIcons({ lucideMail, lucideLock })],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly router = inject(Router);

  login(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl('/dashboard');
  }
}
