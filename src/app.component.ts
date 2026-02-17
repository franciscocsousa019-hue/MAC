import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MappingComponent } from './components/mapping/mapping.component';
import { TrackerComponent } from './components/tracker/tracker.component';
import { TherapyComponent } from './components/therapy/therapy.component';

type Tab = 'dashboard' | 'mapping' | 'tracker' | 'therapy';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DashboardComponent,
    MappingComponent,
    TrackerComponent,
    TherapyComponent,
    NgOptimizedImage
  ]
})
export class AppComponent {
  activeTab = signal<Tab>('dashboard');

  switchTab(tab: Tab) {
    this.activeTab.set(tab);
  }
}