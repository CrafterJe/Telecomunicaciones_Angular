import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-layout',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './account-layout.component.html',
  styleUrl: './account-layout.component.css'
})
export class AccountLayoutComponent {

}
