import { Component, ChangeDetectionStrategy, inject, computed, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AnchorService } from '../../services/anchor.service';
import { Anchor } from '../../anchor.model';

interface UpcomingWindow extends Anchor {
    peakDate: string;
    diffDays: number;
}

// Declaring Chart.js type to avoid TypeScript errors for CDN-loaded library.
declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('mainChart') mainChartCanvas!: ElementRef<HTMLCanvasElement>;
  
  public Math = Math;
  private anchorService = inject(AnchorService);
  private chart: any | null = null;

  upcomingWindows = computed<UpcomingWindow[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.anchorService.anchors()
      .map(anchor => {
        const anchorDate = new Date(anchor.date);
        const currentYearDate = new Date(today.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
        currentYearDate.setHours(0, 0, 0, 0);

        const diffTime = currentYearDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...anchor,
          diffDays,
          peakDate: currentYearDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
        };
      })
      .filter(item => Math.abs(item.diffDays) <= 30)
      .sort((a, b) => a.diffDays - b.diffDays);
  });

  isWindowActive = computed(() => {
    return this.upcomingWindows().some(w => w.valence === 'negative');
  });

  ngAfterViewInit() {
    this.initChart();
  }

  private initChart() {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js not loaded from CDN.');
      return;
    }

    const ctx = this.mainChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    Chart.register(...Chart.registerables);

    this.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['M-4', 'M-3', 'M-2', 'M-1', 'Alvo', 'P+1', 'P+2'],
            datasets: [
                {
                    label: 'VFC (HRV)',
                    data: [65, 62, 58, 42, 38, 52, 60],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Ativação de Esquema',
                    data: [10, 15, 25, 60, 85, 45, 20],
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { family: 'Inter' } } }
            },
            scales: {
                y: { display: false },
                x: { ticks: { font: { family: 'Inter' } } }
            }
        }
    });
  }
}
