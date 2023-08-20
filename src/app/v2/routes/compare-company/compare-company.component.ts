import { Component, OnInit, TemplateRef,AfterViewInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartOption, chartWatermark, strToInt, wrapText } from '@shared/utils/ng2-charts';
import { isObject, sortBy, startCase } from 'lodash-es';
import { CompanyService } from '@services/data/company.service';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-compare-company',
  templateUrl: './compare-company.component.html',
})
export class CompareCompanyComponent implements OnInit, AfterViewInit {

  company: any;
  company2: any;
  revenueGrowth: { year: string; value: string }[] = [];
  revenuePerEmployee: { year: string; value: string }[] = [];
  keyStockPerformanceMetrics: { key: string; value: string }[] = [];
  userVote: any;
  loadingExport = false;
  fullScreenImage?: string;
  fullScreenImageName?: string;
  profitabilityMetricsOverviewHeaders: any[] = [];
  profitabilityMetricsOverviewTitles: any[] = [];
  profitabilityMetricsOverview: any[] = [];

  liquidityMetricsOverviewHeaders: any[] = [];
  liquidityMetricsOverviewTitles: any[] = [];
  liquidityMetricsOverview: any[] = [];

  keyStockPerformanceMetricsOverviewHeaders: any[] = [];
  keyStockPerformanceMetricsOverviewTitles: any[] = [];
  keyStockPerformanceMetricsOverview: any[] = [];

  revenueChartOptions = {
    type: 'bar',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          label: "Dataset2",
          barThickness: 22,
          backgroundColor: (x) => (x.parsed.y >= 400 ? '#000000' : '#DDE3EE'),
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          label: 'Dataset 2',
          barThickness: 22,
          backgroundColor: (x) => (x.parsed.y >= 400 ? '#48a2ef' : '#48a2ef'),
          data: [81, 83, 85, 30, 122, 42],
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
              size: 14,
              weight: '500',
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
    plugins: [
      {
        id: 'chart_custom',
        beforeDraw(chart, args, options) {
          const { ctx } = chart;

          // bar top labels
          ctx.font = '500 10px Inter';
          ctx.fillStyle = '#26292E';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          chart.data.datasets.forEach((dataset, i) => {
            chart.getDatasetMeta(i).data.forEach((bar, index) => {
              const value = dataset.data[index]?.toString();
              ctx.fillText(value || '', bar.x, bar.y - 5);
            });
          });
        },
        afterDraw(chart, args, options) {
          // watermark
          chartWatermark(chart);
        },
      },
    ],
  } as ChartOption<'bar'>;

  employeeChartOptions = {
    type: 'bar',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          // label:"Dataset1",
          barThickness: 22,
          backgroundColor: (x) => (x.parsed.y >= 1000000 ? '#000000' : '#DDE3EE'),
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          // label: 'Dataset 2',
          barThickness: 22,
          backgroundColor: (x) => (x.parsed.y >= 400 ? '#48a2ef' : '#48a2ef'),
          data: [81, 83, 85, 30, 122, 42],
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
              size: 14,
              weight: '500',
            },
            format: {
              notation: 'compact',
              compactDisplay: 'short',
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
    plugins: [
      {
        id: 'chart_custom',
        beforeDraw(chart, args, options) {
          const { ctx } = chart;

          // bar top labels
          ctx.font = '500 10px Inter';
          ctx.fillStyle = '#26292E';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          chart.data.datasets.forEach((dataset, i) => {
            chart.getDatasetMeta(i).data.forEach((bar, index) => {
              const value = dataset.data[index]?.toString();
              ctx.fillText(value || '', bar.x, bar.y - 5);
            });
          });
        },
        afterDraw(chart, args, options) {
          // watermark
          chartWatermark(chart);
        },
      },
    ],
  } as ChartOption<'bar'>;

  ebitdaEbitOptions = {
    type: 'bar',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          label: 'EBITDA',
          barPercentage: 0.85,
          categoryPercentage: 0.4,
          backgroundColor: '#000000',
          data: [80, 30, 45, 50, 120, 48],
          order: 1,
        },
        {
          label: 'EBITDA',
          barPercentage: 0.85,
          categoryPercentage: 0.4,
          backgroundColor: '#48a2ef',
          data: [80, 30, 45, 50, 120, 48],
          order: 1,
        },
        {
          label: 'EBIT',
          barPercentage: 0.85,
          categoryPercentage: 0.4,
          backgroundColor: '#8E99B8',
          data: [80, 30, 45, 50, 120, 48].reverse(),
          order: 1,
        },
        {
          label: 'EBIT',
          barPercentage: 0.85,
          categoryPercentage: 0.4,
          backgroundColor: '#c39a4e',
          data: [80, 30, 45, 50, 120, 48].reverse(),
          order: 1,
        },
        {
          label: 'Earning yoy GROWTH',
          borderColor: '#1A73E8',
          data: [80, 30, 45, 50, 120, 48].reverse(),
          type: 'line',
          pointRadius: 0,
          order: 0,
        },
        {
          label: 'Earning yoy GROWTH',
          borderColor: '#8E99B8',
          data: [80, 30, 45, 50, 120, 48].reverse(),
          type: 'line',
          pointRadius: 0,
          order: 0,
        },
        {
          label: 'EBITDA Margin',
          borderColor: '#4FD1C5',
          data: [80, 30, 45, 50, 120, 48],
          type: 'line',
          pointRadius: 0,
          order: 0,
          borderDash: [5, 5],
        },
        {
          label: 'EBITDA Margin',
          borderColor: '#c39a4e',
          data: [80, 30, 45, 50, 120, 48],
          type: 'line',
          pointRadius: 0,
          order: 0,
          borderDash: [5, 5],
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
            // beginAtZero: false,
            // stepSize: 5,
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
        beforeDraw(chart, args, options) {
          const { ctx } = chart;

          // bar top labels
          ctx.font = '500 10px Inter';
          ctx.fillStyle = '#26292E';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          chart.data.datasets.forEach((dataset, i) => {
            chart.getDatasetMeta(i).data.forEach((bar, index) => {
              const value = dataset.data[index]?.toString();
              ctx.fillText(value || '', bar.x, bar.y - 5);
            });
          });
        },
        afterDraw(chart, args, options) {
          // watermark
          chartWatermark(chart, { fontSize: 56 });
        },
      },
    ],
  } as ChartOption<'bar'>;

  // abandonRateChartOptions = {
  //   type: 'line',
  //   data: {
  //     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  //     datasets: [
  //       {
  //         label: 'Dataset 1',
  //         borderColor: '#EE6002',
  //         backgroundColor: '#EE6002',
  //         borderWidth: 1,
  //         pointRadius: 0,
  //         data: [30, 40, 30, 40, 30, 40, 30, 40, 30, 40, 30, 40],
  //       },
  //       {
  //         label: 'Dataset 2',
  //         borderColor: '#6200EE',
  //         backgroundColor: '#6200EE',
  //         borderWidth: 1,
  //         pointRadius: 0,
  //         data: [50, 60, 50, 60, 50, 60, 50, 60, 50, 60, 50, 60],
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     devicePixelRatio: 4,
  //     scales: {
  //       x: {
  //         grid: {
  //           color: '#DDE3EE',
  //           borderColor: '#4B5468',
  //           tickLength: 0,
  //         },
  //         ticks: {
  //           padding: 12,
  //           color: '#4B5468',
  //           font: {
  //             size: 14,
  //             weight: '500',
  //           },
  //         },
  //       },
  //       y: {
  //         min: 0,
  //         grid: {
  //           borderDash: [3],
  //           borderColor: '#DDE3EE',
  //           color: '#DDE3EE',
  //           tickBorderDash: [3],
  //           tickLength: 12,
  //         },
  //         ticks: {
  //           padding: 14,
  //           color: '#4B5468',
  //           font: {
  //             size: 14,
  //             weight: '500',
  //           },
  //         },
  //       },
  //     },
  //     plugins: {
  //       legend: {
  //         display: true,
  //         position: 'bottom',
  //         align: 'start',
  //         maxHeight: 400,
  //         labels: {
  //           color: '#6E7B91',
  //           font: '500 12px Inter',
  //           padding: 40,
  //           boxWidth: 12,
  //           boxHeight: 12,
  //         },
  //       },
  //     },
  //   },
  //   plugins: [
  //     {
  //       id: 'chart_custom',
  //       afterDraw(chart, args, options) {
  //         // watermark
  //         chartWatermark(chart, { fontSize: 56 });
  //       },
  //     },
  //   ],
  // } as ChartOption<'line'>;

  // liquidityChartOptions = {
  //   type: 'bar',
  //   data: {
  //     labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
  //     datasets: [
  //       {
  //         barThickness: 22,
  //         backgroundColor: '#000000',
  //         data: [80, 30, 45, 50, 120, 48],
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     devicePixelRatio: 4,
  //     scales: {
  //       x: {
  //         grid: {
  //           color: '#DDE3EE',
  //           borderColor: '#4B5468',
  //           tickLength: 0,
  //         },
  //         ticks: {
  //           padding: 12,
  //           color: '#4B5468',
  //           font: {
  //             size: 14,
  //             weight: '500',
  //           },
  //         },
  //       },
  //       y: {
  //         grid: {
  //           borderDash: [3],
  //           borderColor: '#DDE3EE',
  //           color: '#DDE3EE',
  //           tickBorderDash: [3],
  //           tickLength: 12,
  //         },
  //         ticks: {
  //           // maxTicksLimit: 8,
  //           padding: 14,
  //           // beginAtZero: false,
  //           // stepSize: 50,
  //           color: '#4B5468',
  //           font: {
  //             size: 14,
  //             weight: '500',
  //           },
  //         },
  //         // suggestedMax: ({ chart }: { chart: Chart }) => (Number(max(chart.data.datasets[0].data)) || 0) + 90,
  //       },
  //     },
  //     plugins: {
  //       legend: {
  //         display: false,
  //       },
  //     },
  //   },
  //   plugins: [
  //     {
  //       id: 'chart_custom',
  //       beforeDraw(chart, args, options) {
  //         const { ctx } = chart;

  //         // bar top labels
  //         ctx.font = '500 10px Inter';
  //         ctx.fillStyle = '#26292E';
  //         ctx.textAlign = 'center';
  //         ctx.textBaseline = 'bottom';
  //         chart.data.datasets.forEach((dataset, i) => {
  //           chart.getDatasetMeta(i).data.forEach((bar, index) => {
  //             const value = dataset.data[index]?.toString();
  //             ctx.fillText(value || '', bar.x, bar.y - 5);
  //           });
  //         });
  //       },
  //       afterDraw(chart, args, options) {
  //         // watermark
  //         chartWatermark(chart, { fontSize: 46 });
  //       },
  //     },
  //   ],
  // } as ChartOption<'bar'>;

  earningsChartOptions = {
    type: 'bar',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          barThickness: 44,
          backgroundColor: (x) => (x.parsed.y >= 400 ? '#000000' : '#DDE3EE'),
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          barThickness: 44,
          backgroundColor: (x) => (x.parsed.y >= 400 ? '#48a2ef' : '#48a2ef'),
          data: [81, 83, 85, 30, 122, 42],
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
              size: 14,
              weight: '500',
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
    plugins: [
      {
        id: 'chart_custom',
        beforeDraw(chart, args, options) {
          const { ctx } = chart;

          // bar top labels
          ctx.font = '500 10px Inter';
          ctx.fillStyle = '#26292E';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          chart.data.datasets.forEach((dataset, i) => {
            chart.getDatasetMeta(i).data.forEach((bar, index) => {
              const value = dataset.data[index]?.toString();
              ctx.fillText(value || '', bar.x, bar.y - 5);
            });
          });
        },
        afterDraw(chart, args, options) {
          // watermark
          chartWatermark(chart);
        },
      },
    ],
  } as ChartOption<'bar'>;

  expensesLiabilitiesDebtChartOptions = {
    type: 'bar',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          barThickness: 22,
          backgroundColor: '#DDE3EE',
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          barThickness: 22,
          backgroundColor: '#48a2ef',
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          barThickness: 22,
          backgroundColor: '#000000',
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          barThickness: 22,
          backgroundColor: '#c39a4e',
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          barThickness: 22,
          backgroundColor: '#DDE3EE',
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          barThickness: 22,
          backgroundColor: '#48a2ef',
          data: [80, 30, 45, 50, 120, 48],
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
              size: 14,
              weight: '500',
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
    plugins: [
      {
        id: 'chart_custom',
        beforeDraw(chart, args, options) {
          const { ctx } = chart;

          // bar top labels
          ctx.font = '500 10px Inter';
          ctx.fillStyle = '#26292E';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          chart.data.datasets.forEach((dataset, i) => {
            chart.getDatasetMeta(i).data.forEach((bar, index) => {
              const value = dataset.data[index]?.toString();
              ctx.fillText(value || '', bar.x, bar.y - 5);
            });
          });
        },
        afterDraw(chart, args, options) {
          // watermark
          chartWatermark(chart);
        },
      },
    ],
  } as ChartOption<'bar'>;

  quickRatioAndCurrentRatioChartOptions = {
    type: 'line',
    data: {
      labels: [0, 100, 600, 700, 800, 900],
      datasets: [
        {
          label: 'Dataset 1',
          borderColor: '#00C7F2',
          backgroundColor: '#00C7F2',
          borderWidth: 1,
          pointRadius: 0,
          data: [30, 40, 30, 40, 30, 40, 30, 40, 30, 40, 30, 40],
        },
        {
          label: 'Dataset 2',
          borderColor: '#c39a4e',
          backgroundColor: '#c39a4e',
          borderWidth: 1,
          pointRadius: 0,
          data: [30, 40, 30, 40, 30, 40, 30, 40, 30, 40, 30, 40],
        },
        {
          label: 'Dataset 1',
          borderColor: '#00C7F2',
          backgroundColor: '#00C7F2',
          borderWidth: 1,
          pointRadius: 0,
          data: [30, 40, 30, 40, 30, 40, 30, 40, 30, 40, 30, 40],
        },
        {
          label: 'Dataset 2',
          borderColor: '#c39a4e',
          backgroundColor: '#c39a4e',
          borderWidth: 1,
          pointRadius: 0,
          data: [30, 40, 30, 40, 30, 40, 30, 40, 30, 40, 30, 40],
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
          min: 0,
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
          chartWatermark(chart, { fontSize: 56 });
        },
      },
    ],
  } as ChartOption<'line'>;

  // lineChartOptions = {
  //   type: 'line',
  //   data: {
  //     labels: [0, 100, 600, 700, 800, 900],
  //     datasets: [
  //       {
  //         label: 'Dataset 1',
  //         borderColor: '#00C7F2',
  //         backgroundColor: '#00C7F2',
  //         borderWidth: 1,
  //         pointRadius: 0,
  //         data: [30, 40, 30, 40, 30, 40, 30, 40, 30, 40, 30, 40],
  //       },
  //       {
  //         label: 'Dataset 2',
  //         borderColor: '#0FCA7A',
  //         backgroundColor: '#0FCA7A',
  //         borderWidth: 1,
  //         pointRadius: 0,
  //         data: [50, 60, 50, 60, 50, 60, 50, 60, 50, 60, 50, 60],
  //       },
  //       {
  //         label: 'Dataset 3',
  //         borderColor: '#FBC62F',
  //         backgroundColor: '#FBC62F',
  //         borderWidth: 1,
  //         pointRadius: 0,
  //         data: [70, 80, 70, 80, 70, 80, 70, 80, 70, 80, 70, 80],
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     devicePixelRatio: 4,
  //     scales: {
  //       x: {
  //         grid: {
  //           color: '#DDE3EE',
  //           borderColor: '#4B5468',
  //           tickLength: 0,
  //         },
  //         ticks: {
  //           padding: 12,
  //           color: '#4B5468',
  //           font: {
  //             size: 14,
  //             weight: '500',
  //           },
  //         },
  //       },
  //       y: {
  //         min: 0,
  //         grid: {
  //           borderDash: [3],
  //           borderColor: '#DDE3EE',
  //           color: '#DDE3EE',
  //           tickBorderDash: [3],
  //           tickLength: 12,
  //         },
  //         ticks: {
  //           padding: 14,
  //           color: '#4B5468',
  //           font: {
  //             size: 14,
  //             weight: '500',
  //           },
  //         },
  //       },
  //     },
  //     plugins: {
  //       legend: {
  //         display: true,
  //         position: 'bottom',
  //         align: 'start',
  //         maxHeight: 400,
  //         labels: {
  //           color: '#6E7B91',
  //           font: '500 12px Inter',
  //           padding: 40,
  //           boxWidth: 12,
  //           boxHeight: 12,
  //         },
  //       },
  //     },
  //   },
  //   plugins: [
  //     {
  //       id: 'chart_custom',
  //       afterDraw(chart, args, options) {
  //         // watermark
  //         chartWatermark(chart, { fontSize: 56 });
  //       },
  //     },
  //   ],
  // } as ChartOption<'line'>;

  // expensesChartOptions = {
  //   type: 'bar',
  //   data: {
  //     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  //     datasets: [
  //       {
  //         indexAxis: 'y',
  //         barThickness: 16,
  //         backgroundColor: (x) => (x.parsed.x >= 100 ? '#000000' : '#DDE3EE'),
  //         data: [80, 30, 45, 50, 120, 48],
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     devicePixelRatio: 4,
  //     indexAxis: 'y',
  //     scales: {
  //       x: {
  //         grid: {
  //           color: '#DDE3EE',
  //           borderColor: '#4B5468',
  //           tickLength: 0,
  //         },
  //         ticks: {
  //           padding: 12,
  //           color: '#4B5468',
  //           font: {
  //             size: 14,
  //             weight: '500',
  //           },
  //         },
  //       },
  //       y: {
  //         grid: {
  //           borderDash: [3],
  //           borderColor: '#DDE3EE',
  //           color: '#DDE3EE',
  //           tickBorderDash: [3],
  //           tickLength: 12,
  //         },
  //         ticks: {
  //           // maxTicksLimit: 8,
  //           padding: 14,
  //           // beginAtZero: false,
  //           // stepSize: 50,
  //           color: '#4B5468',
  //           font: {
  //             size: 14,
  //             weight: '500',
  //           },
  //         },
  //         // suggestedMax: ({ chart }: { chart: Chart }) => (Number(max(chart.data.datasets[0].data)) || 0) + 90,
  //       },
  //     },
  //     plugins: {
  //       legend: {
  //         display: false,
  //       },
  //     },
  //   },
  //   plugins: [
  //     {
  //       id: 'chart_custom',
  //       beforeDraw(chart, args, options) {
  //         const { ctx } = chart;

  //         // bar top labels
  //         ctx.font = '500 12px Inter';
  //         ctx.fillStyle = '#26292E';
  //         ctx.textAlign = 'right';
  //         chart.data.datasets.forEach((dataset, i) => {
  //           chart.getDatasetMeta(i).data.forEach((bar, index) => {
  //             const value = dataset.data[index]?.toString();
  //             ctx.fillText(value || '', bar.x, bar.y);
  //           });
  //         });
  //       },
  //       afterDraw(chart, args, options) {
  //         // watermark
  //         chartWatermark(chart, { fontSize: 46 });
  //       },
  //     },
  //   ],
  // } as ChartOption<'bar'>;

  id1: any=0
  id2: any=0
  showSearch:boolean=false

  constructor(
    private modalService: NgbModal,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }
  ngAfterViewInit(){
    throw new Error('Method not implemented.');
  }
  async ngOnInit() {

    setTimeout(() => {
      this.showSearch=true
    }, 2000);

    const params = await firstValueFrom(this.route.params);
    this.id1 = Number(params['id1']);
    this.id2 = Number(params['id2']);

    const response = await this.companyService.getOne({
      filters: { id: { $eq: this.id1 } },
      populate: {
        founders: {
          fields: ['fullname', 'position'],
          populate: {
            image: {
              fields: ['url'],
            },
          },
        },
        industries: {
          fields: ['name'],
        },
        logo: {
          fields: ['url'],
        },
        seo: true,
      },
    });

    const response2 = await this.companyService.getOne({
      filters: { id: { $eq: this.id2 } },
      populate: {
        founders: {
          fields: ['fullname', 'position'],
          populate: {
            image: {
              fields: ['url'],
            },
          },
        },
        industries: {
          fields: ['name'],
        },
        logo: {
          fields: ['url'],
        },
        seo: true,
      },
    });
    console.log(response2)
    this.company2 = response2

    // if (response.data[0].attributes.seo[0]) {
    //   this.meta.addTags([
    //     { name: 'title', content: response.data[0].attributes.seo[0].metaTitle },

    //     { name: 'description', content: response.data[0].attributes.seo[0].metaDescription.trim() },
    //   ]);
    // } else {
    //   console.log('neechy wala chala');
    //   this.meta.addTags([
    //     { name: 'title', content: response.data[0].attributes.name },

    //     { name: 'description', content: response.data[0].attributes.fullDescription },
    //   ]);
    // }

    this.company = { id: response.data[0].id, ...response.data[0].attributes };
    console.log('company: ', this.company);

    this.setCharts(this.company, this.company2);

    this.company.hasFollowed = Boolean((await this.companyService.getFollow(this.company.id))?.data.length);
    this.userVote = (await this.companyService.getVote(this.company.id))?.data[0];
    console.log(this.company.name)
  }

  download(canvas: BaseChartDirective, name: string) {
    const base64 = canvas.toBase64Image();

    const a = document.createElement('a');
    a.href = base64 as any;
    a.download = `${name}.png`;
    a.click();
  }
  fullScreen(modal: TemplateRef<any>, canvas: BaseChartDirective, name: string) {
    this.fullScreenImageName = name;
    this.fullScreenImage = canvas.toBase64Image();
    this.modalService.open(modal, { size: 'xl' });
  }

  setCharts(company: any, company2: any) {
    const {
      revenues,
      noOfEmployees,
      revenueGrowth,
      revenuePerEmployee,
      profitabilityMetricsOverview,
      liquidityMetricsOverview,
      earnings,
      expensesLiabilitiesDebt,
      ebitdaAndEbit,
      earningsYoYGrowthAndEBITDAMargin,
      quickRatioAndCurrentRatio,
      keyStockPerformanceMetrics,
      keyStockPerformanceMetricsOverview,
    } = company;


    if (revenues) {
      this.revenueChartOptions.show = true;
      this.revenueChartOptions.data.labels = Object.keys(revenues);
      this.revenueChartOptions.data.datasets[0].data = Object.values<string>(revenues).map(strToInt);
      this.revenueChartOptions.data.datasets[0].label = 'Revenue(' + this.company.name + ')'
      this.revenueChartOptions.data.datasets[1].data = Object.values<string>(company2.data[0].attributes.revenues).map(strToInt);
      this.revenueChartOptions.data.datasets[1].label = 'Revenue(' + this.company2.data[0].attributes.name + ')'
    }

    if (revenueGrowth) {
      this.revenueGrowth = sortBy(
        Object.entries<string>(revenueGrowth).map((x) => ({ year: x[0], value: x[1] })),
        (x) => x.year
      );
      company2.data[0].attributes.revenueGrowth = sortBy(
        Object.entries<string>(company2.data[0].attributes.revenueGrowth).map((x) => ({ year: x[0], value: x[1] })),
        (x) => x.year
      )

    }

    if (noOfEmployees) {
      this.employeeChartOptions.show = true;
      this.employeeChartOptions.data.labels = Object.keys(noOfEmployees);
      this.employeeChartOptions.data.datasets[0].data = Object.values<string>(noOfEmployees).map(strToInt);
      this.employeeChartOptions.data.datasets[0].label = 'Employees(' + this.company.name + ')'
      this.employeeChartOptions.data.datasets[1].data = Object.values<string>(company2.data[0].attributes.noOfEmployees).map(strToInt);
      this.employeeChartOptions.data.datasets[1].label = 'Employees(' + this.company2.data[0].attributes.name + ')'
    }

    if (revenuePerEmployee) {
      this.revenuePerEmployee = sortBy(
        Object.entries<string>(revenuePerEmployee).map((x) => ({ year: x[0], value: x[1] })),
        (x) => x.year
      );
      company2.data[0].attributes.revenuePerEmployee = sortBy(
        Object.entries<string>(company2.data[0].attributes.revenuePerEmployee).map((x) => ({ year: x[0], value: x[1] })),
        (x) => x.year
      )
      console.log(company2.data[0].attributes.revenuePerEmployee)
    }

    if (profitabilityMetricsOverview) {
      let headers = Object.keys(Object.values<string>(profitabilityMetricsOverview)[0])
        .filter((x) => x != 'Unit')
        .sort();

      this.profitabilityMetricsOverviewHeaders = ['Unit', ...headers];
      this.profitabilityMetricsOverviewTitles = Object.keys(profitabilityMetricsOverview).sort();
      this.profitabilityMetricsOverview = profitabilityMetricsOverview;
    }

    // if (keyStockPerformanceMetrics) {
    //   this.keyStockPerformanceMetrics = Object.entries<string>(keyStockPerformanceMetrics).map(([key, value]) => ({
    //     key: startCase(key).toUpperCase(),
    //     value,
    //   }));
    // }

    // if (keyStockPerformanceMetricsOverview) {
    //   let headers = Object.keys(Object.values<string>(keyStockPerformanceMetricsOverview)[0])
    //     .filter((x) => x != 'Unit')
    //     .sort();

    //   this.keyStockPerformanceMetricsOverviewHeaders = ['Unit', ...headers];
    //   this.keyStockPerformanceMetricsOverviewTitles = Object.keys(keyStockPerformanceMetricsOverview).sort();
    //   this.keyStockPerformanceMetricsOverview = keyStockPerformanceMetricsOverview;
    // }

    if (ebitdaAndEbit && earningsYoYGrowthAndEBITDAMargin) {
      this.ebitdaEbitOptions.show = true;
      this.ebitdaEbitOptions.data.labels = Object.keys(ebitdaAndEbit.ebitda_result);
      this.ebitdaEbitOptions.data.datasets[0].data = Object.values<string>(ebitdaAndEbit.ebitda_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[0].label = 'EBITDA(' + this.company.name + ')'
      this.ebitdaEbitOptions.data.datasets[1].data = Object.values<string>(company2.data[0].attributes.ebitdaAndEbit.ebitda_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[1].label = 'EBITDA(' + this.company2.data[0].attributes.name + ')'
      this.ebitdaEbitOptions.data.datasets[2].data = Object.values<string>(ebitdaAndEbit.ebit_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[2].label = 'EBIT(' + this.company.name + ')'
      this.ebitdaEbitOptions.data.datasets[3].data = Object.values<string>(company2.data[0].attributes.ebitdaAndEbit.ebitda_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[3].label = 'EBIT(' + this.company2.data[0].attributes.name + ')'
      this.ebitdaEbitOptions.data.datasets[4].data = Object.values<string>(earningsYoYGrowthAndEBITDAMargin.earningsYoYGrowth_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[4].label = 'Earning yoy GROWTH(' + this.company.name + ')'
      this.ebitdaEbitOptions.data.datasets[5].data = Object.values<string>(company2.data[0].attributes.earningsYoYGrowthAndEBITDAMargin.earningsYoYGrowth_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[5].label = 'Earning yoy GROWTH(' + this.company2.data[0].attributes.name + ')'
      this.ebitdaEbitOptions.data.datasets[6].data = [
        null as any,
        ...Object.values<string>(earningsYoYGrowthAndEBITDAMargin.ebitdaMargin_result).map(strToInt),
      ];
      this.ebitdaEbitOptions.data.datasets[6].label = 'EBITDA Margin(' + this.company.name + ')'
      this.ebitdaEbitOptions.data.datasets[7].data = [
        null as any,
        ...Object.values<string>(company2.data[0].attributes.earningsYoYGrowthAndEBITDAMargin.ebitdaMargin_result).map(strToInt),
      ];
      this.ebitdaEbitOptions.data.datasets[7].label = 'EBITDA Margin(' + this.company2.data[0].attributes.name + ')'
    }

    // if (liquidityMetricsOverview) {
    //   let headers = Object.keys(Object.values<string>(liquidityMetricsOverview)[0])
    //     .filter((x) => x != 'Unit')
    //     .sort();

    //   this.liquidityMetricsOverviewHeaders = ['Unit', ...headers];
    //   this.liquidityMetricsOverviewTitles = Object.keys(liquidityMetricsOverview).sort();
    //   this.liquidityMetricsOverview = liquidityMetricsOverview;
    // }

    if (earnings) {
      this.earningsChartOptions.show = true;
      this.earningsChartOptions.data.labels = Object.keys(earnings);
      this.earningsChartOptions.data.datasets[0].data = Object.values<string>(earnings).map(strToInt);
      this.earningsChartOptions.data.datasets[0].label = 'Earnings(' + this.company.name + ')'
      this.earningsChartOptions.data.datasets[1].data = Object.values<string>(company2.data[0].attributes.earnings).map(strToInt);
      this.earningsChartOptions.data.datasets[1].label = 'Earnings(' + this.company2.data[0].attributes.name + ')'
    }

    if (expensesLiabilitiesDebt) {
      this.expensesLiabilitiesDebtChartOptions.show = true;
      this.expensesLiabilitiesDebtChartOptions.data.labels = Object.keys(expensesLiabilitiesDebt.totalExpenses_result);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[0].data = Object.values<string>(expensesLiabilitiesDebt.totalExpenses_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[0].label = 'Expenses(' + this.company.name + ')'
      this.expensesLiabilitiesDebtChartOptions.data.datasets[1].data = Object.values<string>(company2.data[0].attributes.expensesLiabilitiesDebt.totalExpenses_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[1].label = 'Expenses(' + this.company2.data[0].attributes.name + ')'
      this.expensesLiabilitiesDebtChartOptions.data.datasets[2].data = Object.values<string>(expensesLiabilitiesDebt.totalLiabilities_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[2].label = 'Liabilities(' + this.company.name + ')'
      this.expensesLiabilitiesDebtChartOptions.data.datasets[3].data = Object.values<string>(company2.data[0].attributes.expensesLiabilitiesDebt.totalLiabilities_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[3].label = 'Liabilities(' + this.company2.data[0].attributes.name + ')'
      this.expensesLiabilitiesDebtChartOptions.data.datasets[4].data = Object.values<string>(expensesLiabilitiesDebt.totalDebt_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[4].label = 'Debt(' + this.company.name + ')'
      this.expensesLiabilitiesDebtChartOptions.data.datasets[5].data = Object.values<string>(company2.data[0].attributes.expensesLiabilitiesDebt.totalDebt_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[5].label = 'Debt(' + this.company2.data[0].attributes.name + ')'
    }

    if (quickRatioAndCurrentRatio) {
      this.quickRatioAndCurrentRatioChartOptions.show = true;
      this.quickRatioAndCurrentRatioChartOptions.data.labels = Object.keys(quickRatioAndCurrentRatio.quickRatio_result);
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[0].data = Object.values<string>(quickRatioAndCurrentRatio.quickRatio_result).map(strToInt);
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[0].label = 'Quick Ratio(' + this.company.name + ')'
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[1].data = Object.values<string>(company2.data[0].attributes.quickRatioAndCurrentRatio.quickRatio_result).map(strToInt);
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[1].label = 'Quick Ratio(' + this.company2.data[0].attributes.name + ')'
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[2].data = Object.values<string>(quickRatioAndCurrentRatio.currentRatio_result).map(strToInt);
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[2].label = 'Current Ratio(' + this.company.name + ')'
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[3].data = Object.values<string>(company2.data[0].attributes.quickRatioAndCurrentRatio.currentRatio_result).map(strToInt);
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[3].label = 'Current Ratio(' + this.company2.data[0].attributes.name + ')'
    }
  }

}
