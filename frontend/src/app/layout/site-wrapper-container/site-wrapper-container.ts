import { Component } from '@angular/core';
import { Topbar } from '../topbar/topbar';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-site-wrapper-container',
  imports: [RouterOutlet, Topbar, Sidebar],
  templateUrl: './site-wrapper-container.html',
  styleUrl: './site-wrapper-container.scss',
})
export class SiteWrapperContainer {}
