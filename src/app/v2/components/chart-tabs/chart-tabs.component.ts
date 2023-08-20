import { AfterViewInit, Component, Input, TemplateRef } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartOption, chartWatermark, strToInt } from '@shared/utils/ng2-charts';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

export interface AppChart {
  data: any;
  title: string;
  unit: string;
  type: ChartType;
  barStacked?: boolean;
  legend?: boolean;
  height?: number;
}

const barColors = ['#898989', '#000000', '#E9E9E9', '#987662', '#A881A1', '#9ADBD3', '#547AA5', '#749659', '#E8933F', '#D36760', '#443F3E'];
const lineColors = ['#1A73E8', '#F7BA1E', '#000000', '#987662', '#A881A1', '#9ADBD3', '#547AA5', '#749659', '#E8933F', '#D36760', '#443F3E'];

@Component({
  selector: 'app-chart-tabs',
  templateUrl: './chart-tabs.component.html',
  styleUrls: ['./chart-tabs.component.scss'],
})
export class ChartTabsComponent implements AfterViewInit {
  @Input() charts!: AppChart[];

  chartOptions: (AppChart & { options: ChartOption<any> })[] = [];
  fullScreenImage?: string;
  fullScreenImageName?: string;

  constructor(private modalService: NgbModal) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      for (let chart of this.charts) {
        if (!chart.data) continue;

        // DEFAULT SETTINGS
        chart = {
          legend: true,
          height: 450,
          ...chart,
        };

        if (chart.type === 'bar') {
          this.chartOptions.push({ ...chart, options: this.getBarChartOptions(chart) });
        } else if (chart.type === 'line') {
          this.chartOptions.push({ ...chart, options: this.getLineChartOptions(chart) });
        }
      }
    });
  }

  download(canvas: BaseChartDirective, chart: AppChart & { options: ChartOption<any> }) {
    const base64 = canvas.toBase64Image();

    const a = document.createElement('a');
    a.href = base64 as any;
    a.download = `${chart.title} - ${chart.unit}.png`;
    a.click();
  }

  fullScreen(modal: TemplateRef<any>, canvas: BaseChartDirective, chart: AppChart & { options: ChartOption<any> }) {
    this.fullScreenImageName = `${chart.title} - ${chart.unit}`;
    this.fullScreenImage = canvas.toBase64Image();
    this.modalService.open(modal, { size: 'xl' });
  }

  getBarChartOptions({ data, barStacked, legend }: AppChart) {
    const options = {
      type: 'bar',
      data: {
        labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023'],
        datasets: [
          {
            label: '',
            barThickness: 22,
            backgroundColor: '#DDE3EE',
            data: [39, 39, 39, 39, 39, 39],
          },
          {
            label: '',
            barThickness: 22,
            backgroundColor: '#000000',
            data: [40, 40, 40, 40, 40, 40],
          },
          {
            label: '',
            barThickness: 22,
            backgroundColor: '#DDE3EE',
            data: [41, 41, 41, 41, 41, 41],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 4,
        scales: {
          x: {
            stacked: true,
            grid: {
              color: '#DDE3EE',
              borderColor: '#4B5468',
              tickLength: 0,
            },
            ticks: {
              padding: 12,
              color: '#4B5468',
              font: {
                size: 12,
                weight: '500',
              },
            },
          },
          y: {
            stacked: true,
            grid: {
              borderDash: [3],
              borderColor: '#DDE3EE',
              color: '#DDE3EE',
              tickBorderDash: [3],
              tickLength: 12,
            },
            ticks: {
              maxTicksLimit: 5,
              padding: 14,
              color: '#4B5468',
              font: {
                size: 12,
                weight: '500',
              },
            },
          },
        },
        plugins: {
          legend: {
            display: legend,
            position: 'bottom',
            align: 'center',
            // maxHeight: 1000,
            labels: {
              color: '#6E7B91',
              font: '500 12px Inter',
              padding: 40,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
        },
      },
      plugins: [
        {
          id: 'chart_custom',
          afterDraw(chart, args, options) {
            // watermark
            chartWatermark(chart);
          },
          // beforeDraw(chart, args, options) {
          // const { ctx } = chart;
          // // bar top labels
          // ctx.font = '500 10px Inter';
          // ctx.fillStyle = '#26292E';
          // ctx.textAlign = 'center';
          // ctx.textBaseline = 'bottom';
          // chart.data.datasets.forEach((dataset, i) => {
          //   chart.getDatasetMeta(i).data.forEach((bar, index) => {
          //     const value = dataset.data[index]?.toString();
          //     ctx.fillText(value || '', bar.x, bar.y - 5);
          //   });
          // });
          // },
        },
      ],
    } as ChartOption<'bar'>;

    options.data.labels = Object.keys(Object.values<string>(data)[0]);
    options.data.datasets = [];

    Object.entries<any>(data).forEach(([key, value], index) => {
      if (key === 'Total') return;

      options.data.datasets.push({
        label: key,
        barThickness: 28,
        backgroundColor: barColors[index],
        data: Object.values<string>(value).map(strToInt),
      });
    });

    if (options.options?.scales?.['x']) {
      options.options.scales['x'].stacked = Boolean(barStacked);
    }

    if (options.options?.scales?.['y']) {
      options.options.scales['y'].stacked = Boolean(barStacked);
    }

    return options;
  }

  getLineChartOptions({ data }: AppChart) {
    const options = {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Dataset 1',
            borderColor: '#EE6002',
            backgroundColor: '#EE6002',
            borderWidth: 1,
            pointRadius: 0,
            data: [30, 40, 30, 40, 30, 40, 30, 40, 30, 40, 30, 40],
          },
          {
            label: 'Dataset 2',
            borderColor: '#6200EE',
            backgroundColor: '#6200EE',
            borderWidth: 1,
            pointRadius: 0,
            data: [50, 60, 50, 60, 50, 60, 50, 60, 50, 60, 50, 60],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 4,
        scales: {
          x: {
            grid: {
              color: '#DDE3EE',
              borderColor: '#4B5468',
              tickLength: 0,
            },
            ticks: {
              padding: 12,
              color: '#4B5468',
              font: {
                size: 14,
                weight: '500',
              },
            },
          },
          y: {
            // min: 0,
            grid: {
              borderDash: [3],
              borderColor: '#DDE3EE',
              color: '#DDE3EE',
              tickBorderDash: [3],
              tickLength: 12,
            },
            ticks: {
              padding: 14,
              color: '#4B5468',
              font: {
                size: 14,
                weight: '500',
              },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'start',
            maxHeight: 400,
            labels: {
              color: '#6E7B91',
              font: '500 12px Inter',
              padding: 40,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
        },
      },
      plugins: [
        {
          id: 'chart_custom',
          afterDraw(chart, args, options) {
            // watermark
            chartWatermark(chart);
          },
        },
      ],
    } as ChartOption<'line'>;

    options.data.labels = Object.keys(Object.values<string>(data)[0]);
    options.data.datasets = [];

    Object.entries<any>(data).forEach(([key, value], index) => {
      if (key === 'Total') return;

      options.data.datasets.push({
        label: key,
        borderColor: lineColors[index],
        borderWidth: 1,
        pointRadius: 0,
        data: Object.values<string>(value).map(strToInt),
      });
    });

    return options;
  }
}
