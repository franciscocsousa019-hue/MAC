import { Injectable, signal } from '@angular/core';
import { Anchor } from '../anchor.model';

@Injectable({ providedIn: 'root' })
export class AnchorService {
  private readonly initialAnchors: Anchor[] = [
    { date: '2022-03-20', title: 'Período de Stress Intenso', valence: 'negative', meta: { smell: 'Hospital/Limpeza', weather: 'Chuvoso' } },
    { date: '2023-10-10', title: 'Conquista de Grande Alívio', valence: 'positive', meta: { smell: 'Ar livre/Pinho', weather: 'Sol ameno' } }
  ];

  anchors = signal<Anchor[]>(this.initialAnchors);

  addAnchor(anchor: Anchor) {
    this.anchors.update(currentAnchors => [...currentAnchors, anchor]);
  }
}
