import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackerComponent {
  ghostLevel = signal(0);

  updateGhostLevel(event: Event) {
    this.ghostLevel.set(Number((event.target as HTMLInputElement).value));
  }

  saveSomaticState() {
    alert('Dados registados para análise de deriva.');
  }
}
