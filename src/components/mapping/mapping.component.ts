import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { AnchorService } from '../../services/anchor.service';
import { Anchor } from '../../anchor.model';

@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingComponent {
  anchorSaved = output<void>();
  private anchorService = inject(AnchorService);

  // Form state as signals
  date = signal('');
  valence = signal<'positive' | 'negative'>('negative');
  title = signal('');
  smell = signal('');
  weather = signal('');
  imageUrl = signal('');

  saveAnchor() {
    if (!this.date() || !this.title()) {
      alert("Por favor, preencha a data e o título.");
      return;
    }

    const newAnchor: Anchor = {
      date: this.date(),
      title: this.title(),
      valence: this.valence(),
      meta: {
        smell: this.smell(),
        weather: this.weather(),
        imageUrl: this.imageUrl() || undefined,
      }
    };

    this.anchorService.addAnchor(newAnchor);
    alert("Evento ancorado no sistema.");
    this.resetForm();
    this.anchorSaved.emit();
  }

  updateSignal(signal: any, event: Event) {
    signal.set((event.target as HTMLInputElement).value);
  }

  updateValence(event: Event) {
    this.valence.set((event.target as HTMLSelectElement).value as 'positive' | 'negative');
  }

  resetForm() {
    this.date.set('');
    this.valence.set('negative');
    this.title.set('');
    this.smell.set('');
    this.weather.set('');
    this.imageUrl.set('');
  }
}