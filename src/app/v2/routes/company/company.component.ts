import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyFollowerService } from '@services/data/company-follower.service';
import { CompanyService } from '@services/data/company.service';
import { UserService } from '@services/data/user.service';
import { ChartOption, chartWatermark, strToInt, wrapText } from '@shared/utils/ng2-charts';
import { Chart } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { isObject, sortBy, startCase } from 'lodash-es';
import { BaseChartDirective } from 'ng2-charts';
import { Papa } from 'ngx-papaparse';
import * as qs from 'qs';
import { firstValueFrom } from 'rxjs';


Chart.register(TreemapController, TreemapElement);

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
})
export class CompanyComponent implements OnInit {
  revenueChartOptions = {
    type: 'bar',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          barThickness: 22,
          backgroundColor: (x) => (x.parsed.y >= 400 ? '#000000' : '#DDE3EE'),
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
          display: false,
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
          barThickness: 22,
          backgroundColor: (x) => (x.parsed.y >= 1000000 ? '#000000' : '#DDE3EE'),
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
            format: {
              notation: 'compact',
              compactDisplay: 'short',
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
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

  profitabilityMetricsOverviewHeaders: any[] = [];
  profitabilityMetricsOverviewTitles: any[] = [];
  profitabilityMetricsOverview: any[] = [];

  liquidityMetricsOverviewHeaders: any[] = [];
  liquidityMetricsOverviewTitles: any[] = [];
  liquidityMetricsOverview: any[] = [];

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
          label: 'EBIT',
          barPercentage: 0.85,
          categoryPercentage: 0.4,
          backgroundColor: '#8E99B8',
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
          label: 'EBITDA Margin',
          borderColor: '#4FD1C5',
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

  abandonRateChartOptions = {
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

  liquidityChartOptions = {
    type: 'bar',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          barThickness: 22,
          backgroundColor: '#000000',
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
            // maxTicksLimit: 8,
            padding: 14,
            // beginAtZero: false,
            // stepSize: 50,
            color: '#4B5468',
            font: {
              size: 14,
              weight: '500',
            },
          },
          // suggestedMax: ({ chart }: { chart: Chart }) => (Number(max(chart.data.datasets[0].data)) || 0) + 90,
        },
      },
      plugins: {
        legend: {
          display: false,
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
          chartWatermark(chart, { fontSize: 46 });
        },
      },
    ],
  } as ChartOption<'bar'>;

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
          display: false,
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
          backgroundColor: '#000000',
          data: [80, 30, 45, 50, 120, 48],
        },
        {
          barThickness: 22,
          backgroundColor: '#DDE3EE',
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
          display: false,
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
          label: 'Dataset 1',
          borderColor: '#00C7F2',
          backgroundColor: '#00C7F2',
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

  lineChartOptions = {
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
          borderColor: '#0FCA7A',
          backgroundColor: '#0FCA7A',
          borderWidth: 1,
          pointRadius: 0,
          data: [50, 60, 50, 60, 50, 60, 50, 60, 50, 60, 50, 60],
        },
        {
          label: 'Dataset 3',
          borderColor: '#FBC62F',
          backgroundColor: '#FBC62F',
          borderWidth: 1,
          pointRadius: 0,
          data: [70, 80, 70, 80, 70, 80, 70, 80, 70, 80, 70, 80],
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

  expensesChartOptions = {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          indexAxis: 'y',
          barThickness: 16,
          backgroundColor: (x) => (x.parsed.x >= 100 ? '#000000' : '#DDE3EE'),
          data: [80, 30, 45, 50, 120, 48],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 4,
      indexAxis: 'y',
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
            // maxTicksLimit: 8,
            padding: 14,
            // beginAtZero: false,
            // stepSize: 50,
            color: '#4B5468',
            font: {
              size: 14,
              weight: '500',
            },
          },
          // suggestedMax: ({ chart }: { chart: Chart }) => (Number(max(chart.data.datasets[0].data)) || 0) + 90,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    plugins: [
      {
        id: 'chart_custom',
        beforeDraw(chart, args, options) {
          const { ctx } = chart;

          // bar top labels
          ctx.font = '500 12px Inter';
          ctx.fillStyle = '#26292E';
          ctx.textAlign = 'right';
          chart.data.datasets.forEach((dataset, i) => {
            chart.getDatasetMeta(i).data.forEach((bar, index) => {
              const value = dataset.data[index]?.toString();
              ctx.fillText(value || '', bar.x, bar.y);
            });
          });
        },
        afterDraw(chart, args, options) {
          // watermark
          chartWatermark(chart, { fontSize: 46 });
        },
      },
    ],
  } as ChartOption<'bar'>;

  keyStockPerformanceMetricsOverviewHeaders: any[] = [];
  keyStockPerformanceMetricsOverviewTitles: any[] = [];
  keyStockPerformanceMetricsOverview: any[] = [];

  colors = ['#D9D9D9', '#63B0DB', '#824A68', '#987662', '#A881A1', '#9ADBD3', '#547AA5', '#749659', '#E8933F', '#D36760', '#443F3E'].reverse();
  colorIndex = 0;
  companyRankingOptions = {
    type: 'treemap',
    data: {
      datasets: [
        {
          label: 'qwerty',
          tree: [
            { category: 0, title: 'Saudi Aramco', value: 42657 },
            { category: 0, title: 'Ryfinery', value: 38844 },
            { category: 0, title: 'Batelco', value: 34381 },
            { category: 0, title: 'Zain', value: 29996 },
            { category: 0, title: 'Futaim Group', value: 29996 },
            { category: 0, title: 'YK', value: 29996 },

            { category: 1, title: 'Saudi Aramco 1', value: 42657 },
            { category: 1, title: 'Ryfinery 1', value: 38844 },
            { category: 1, title: 'Batelco 1', value: 34381 },
            { category: 1, title: 'Zain 1', value: 29996 },
            { category: 1, title: 'Futaim Group 1', value: 29996 },
            { category: 1, title: 'YK 1', value: 29996 },

            { category: 2, title: 'Saudi Aramco 2', value: 42657 },
            { category: 2, title: 'Ryfinery 2', value: 38844 },
            { category: 2, title: 'Batelco 2', value: 34381 },
            { category: 2, title: 'Zain 2', value: 29996 },
            { category: 2, title: 'Futaim Group 2', value: 29996 },
            { category: 2, title: 'YK 2', value: 29996 },

            { category: 3, title: 'Saudi Aramco 3', value: 42657 },
            { category: 3, title: 'Ryfinery 3', value: 38844 },
            { category: 3, title: 'Batelco 3', value: 34381 },
            { category: 3, title: 'Zain 3', value: 29996 },
            { category: 3, title: 'Futaim Group 3', value: 29996 },
            { category: 3, title: 'YK 3', value: 29996 },

            { category: 4, title: 'Saudi Aramco 4', value: 42657 },
            { category: 4, title: 'Ryfinery 4', value: 38844 },
            { category: 4, title: 'Batelco 4', value: 34381 },
            { category: 4, title: 'Zain 4', value: 29996 },
            { category: 4, title: 'Futaim Group 4', value: 29996 },
            { category: 4, title: 'YK 4', value: 29996 },

            { category: 5, title: 'Saudi Aramco 5', value: 42657 },
            { category: 5, title: 'Ryfinery 5', value: 38844 },
            { category: 5, title: 'Batelco 5', value: 34381 },
            { category: 5, title: 'Zain 5', value: 29996 },
            { category: 5, title: 'Futaim Group 5', value: 29996 },
            { category: 5, title: 'YK 5', value: 29996 },

            { category: 6, title: 'Saudi Aramco 6', value: 42657 },
            { category: 6, title: 'Ryfinery 6', value: 38844 },
            { category: 6, title: 'Batelco 6', value: 34381 },
            { category: 6, title: 'Zain 6', value: 29996 },
            { category: 6, title: 'Futaim Group 6', value: 29996 },
            { category: 6, title: 'YK 6', value: 29996 },
          ] as any,
          key: 'value',
          groups: ['title'],
          backgroundColor: (ctx, options) => {
            if (ctx.dataIndex === undefined) return;

            const index = ctx.dataIndex;
            const { category } = ctx.dataset.tree?.[index];
            // const previousCategory = ctx.dataset.tree?.[index - 1]?.category;
            // if (category !== previousCategory) this.colorIndex++;

            return this.colors[category];
          },
          // backgroundColor: (ctx, o) => colorFromRaw(ctx),
          labels: {
            display: true,
            color: 'white',
            align: 'left',
            position: 'top',
            padding: 8,
            formatter: (context, options) => {
              const { data, ctx } = context.chart;
              const item = (data.datasets[context.datasetIndex] as any).tree[context.dataIndex];
              return [...wrapText(ctx, item.title, 10, 10, 60, 140), item.value];
            },
            font(context, options) {
              const { data, ctx } = context.chart;
              const item = (data.datasets[context.datasetIndex] as any).tree[context.dataIndex];
              const font = { size: 14, weight: '400', family: 'Inter', lineHeight: 1.2 };
              const fonts = wrapText(ctx, item.title, 10, 10, 60, 140).map(() => font);

              fonts.push({ ...font, lineHeight: 2 });
              return fonts;
            },
          },
        },
      ],
    },
    options: {
      // aspectRatio: 1.5,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        datalabels: {
          color: 'blue',
          labels: {
            title: {
              font: {
                weight: 'bold',
              },
            },
            value: {
              color: 'green',
            },
          },
        },
      } as any,
    },
  } as ChartOption<'treemap'>;

  company: any;
  revenueGrowth: { year: string; value: string }[] = [];
  revenuePerEmployee: { year: string; value: string }[] = [];
  keyStockPerformanceMetrics: { key: string; value: string }[] = [];
  userVote: any;
  loadingExport = false;
  fullScreenImage?: string;
  fullScreenImageName?: string;
  id1:any;
  companies:any;
  

  constructor(
    private companyService: CompanyService,
    private companyFollowerService: CompanyFollowerService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private modalService: NgbModal,
    private papa: Papa,
    private meta: Meta,
    public activeModal: NgbActiveModal
  ) {}

  async ngOnInit(): Promise<void> {
    const params = await firstValueFrom(this.route.params);
    const id = Number(params['id']);
    this.id1=id

    const response = await this.companyService.getOne({
      filters: { id: { $eq: id } },
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

    if (response.data[0].attributes.seo[0]) {
      this.meta.addTags([
        { name: 'title', content: response.data[0].attributes.seo[0].metaTitle },

        { name: 'description', content: response.data[0].attributes.seo[0].metaDescription.trim() },
      ]);
    } else {
      console.log('neechy wala chala');
      this.meta.addTags([
        { name: 'title', content: response.data[0].attributes.name },

        { name: 'description', content: response.data[0].attributes.fullDescription },
      ]);
    }

    this.company = { id: response.data[0].id, ...response.data[0].attributes };
    console.log('company: ', this.company);

    this.setCharts(this.company);

    this.company.hasFollowed = Boolean((await this.companyService.getFollow(this.company.id))?.data.length);
    this.userVote = (await this.companyService.getVote(this.company.id))?.data[0];
    localStorage.removeItem("compareCompany1")
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

  openIndustry(industry: any) {
    this.router.navigate(['/companies'], {
      queryParams: {
        filter: qs.stringify(
          {
            filters: {
              industries: { id: { $eq: industry.id } },
            },
          },
          { encode: false }
        ), // add query params in url
      },
    });
  }

  follow(company: any, type: 'follow' | 'unfollow') {
    if (!this.userService.hasUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.companyService
      .follow(company.id, type)
      .then((x) => {
        if (!x) return;

        company.followers = x.followers;
        company.hasFollowed = x.following;
      })
      .catch((e) => {});
  }

  async vote(type: 'like' | 'dislike') {
    if (!this.userService.hasUser) {
      this.router.navigate(['/login']);
      return;
    }

    await this.companyService
      .vote(this.company.id, type)
      .then((x) => {
        this.company.likes = x?.likes;
        this.userVote = x?.vote.data;
      })
      .catch((e) => {});
  }

  async shareProfile() {
    await navigator.share({
      title: 'Share Company Profile',
      url: window.location.href,
    });
  }

  async export() {
    this.loadingExport = true;

    const company = { ...this.company };
    // delete entity.logo;
    // if (company.industries) company.industries = company.industries.data[0].attributes.name;

    Object.entries<any>(company).forEach(([key, value]) => {
      if (key === 'industries') {
        company[key] = value.data[0].attributes.name;
      } else if (key === 'founders') {
        company[key] = value.data[0].attributes.fullname;
      } else if (key === 'logo') {
        delete company[key];
      } else if (isObject(value)) {
        company[key] = JSON.stringify(value);
      }
    });

    const csv = this.papa.unparse([company]);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fileURL = URL.createObjectURL(csvData);

    const ancher = document.createElement('a');
    ancher.style.display = 'none';
    ancher.href = fileURL;
    ancher.download = `${company.name} (${formatDate(new Date(), 'd-MMM-y h-mm a', 'en-US')}).csv`;
    ancher.click();

    await new Promise((r) => setTimeout(r, 2000));
    this.loadingExport = false;
  }

  setCharts(company: any) {
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
    }

    if (revenueGrowth) {
      this.revenueGrowth = sortBy(
        Object.entries<string>(revenueGrowth).map((x) => ({ year: x[0], value: x[1] })),
        (x) => x.year
      );
    }

    if (noOfEmployees) {
      this.employeeChartOptions.show = true;
      this.employeeChartOptions.data.labels = Object.keys(noOfEmployees);
      this.employeeChartOptions.data.datasets[0].data = Object.values<string>(noOfEmployees).map(strToInt);
      this.employeeChartOptions.data.datasets[0].label = 'Employees(' + this.company.name + ')'
    }

    if (revenuePerEmployee) {
      this.revenuePerEmployee = sortBy(
        Object.entries<string>(revenuePerEmployee).map((x) => ({ year: x[0], value: x[1] })),
        (x) => x.year
      );
    }

    if (profitabilityMetricsOverview) {
      let headers = Object.keys(Object.values<string>(profitabilityMetricsOverview)[0])
        .filter((x) => x != 'Unit')
        .sort();

      this.profitabilityMetricsOverviewHeaders = ['Unit', ...headers];
      this.profitabilityMetricsOverviewTitles = Object.keys(profitabilityMetricsOverview).sort();
      this.profitabilityMetricsOverview = profitabilityMetricsOverview;
    }

    if (keyStockPerformanceMetrics) {
      this.keyStockPerformanceMetrics = Object.entries<string>(keyStockPerformanceMetrics).map(([key, value]) => ({
        key: startCase(key).toUpperCase(),
        value,
      }));
    }

    if (keyStockPerformanceMetricsOverview) {
      let headers = Object.keys(Object.values<string>(keyStockPerformanceMetricsOverview)[0])
        .filter((x) => x != 'Unit')
        .sort();

      this.keyStockPerformanceMetricsOverviewHeaders = ['Unit', ...headers];
      this.keyStockPerformanceMetricsOverviewTitles = Object.keys(keyStockPerformanceMetricsOverview).sort();
      this.keyStockPerformanceMetricsOverview = keyStockPerformanceMetricsOverview;
    }

    if (ebitdaAndEbit && earningsYoYGrowthAndEBITDAMargin) {
      this.ebitdaEbitOptions.show = true;
      this.ebitdaEbitOptions.data.labels = Object.keys(ebitdaAndEbit.ebitda_result);
      this.ebitdaEbitOptions.data.datasets[0].data = Object.values<string>(ebitdaAndEbit.ebitda_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[0].label = 'EBITDA(' + this.company.name + ')'
      this.ebitdaEbitOptions.data.datasets[1].data = Object.values<string>(ebitdaAndEbit.ebit_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[2].label = 'EBIT(' + this.company.name + ')'
      this.ebitdaEbitOptions.data.datasets[2].data = Object.values<string>(earningsYoYGrowthAndEBITDAMargin.earningsYoYGrowth_result).map(strToInt);
      this.ebitdaEbitOptions.data.datasets[2].label = 'Earning yoy GROWTH(' + this.company.name + ')'
      this.ebitdaEbitOptions.data.datasets[3].data = [
        null as any,
        ...Object.values<string>(earningsYoYGrowthAndEBITDAMargin.ebitdaMargin_result).map(strToInt),
      ];
      this.ebitdaEbitOptions.data.datasets[3].label = 'EBITDA Margin(' + this.company.name + ')'
    }

    if (liquidityMetricsOverview) {
      let headers = Object.keys(Object.values<string>(liquidityMetricsOverview)[0])
        .filter((x) => x != 'Unit')
        .sort();

      this.liquidityMetricsOverviewHeaders = ['Unit', ...headers];
      this.liquidityMetricsOverviewTitles = Object.keys(liquidityMetricsOverview).sort();
      this.liquidityMetricsOverview = liquidityMetricsOverview;
    }

    if (earnings) {
      this.earningsChartOptions.show = true;
      this.earningsChartOptions.data.labels = Object.keys(earnings);
      this.earningsChartOptions.data.datasets[0].data = Object.values<string>(earnings).map(strToInt);
    }

    if (expensesLiabilitiesDebt) {
      this.expensesLiabilitiesDebtChartOptions.show = true;
      this.expensesLiabilitiesDebtChartOptions.data.labels = Object.keys(expensesLiabilitiesDebt.totalExpenses_result);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[0].data = Object.values<string>(expensesLiabilitiesDebt.totalExpenses_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[0].label = 'Expenses(' + this.company.name + ')'
      this.expensesLiabilitiesDebtChartOptions.data.datasets[1].data = Object.values<string>(expensesLiabilitiesDebt.totalLiabilities_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[1].label = 'Liabilities(' + this.company.name + ')'
      this.expensesLiabilitiesDebtChartOptions.data.datasets[2].data = Object.values<string>(expensesLiabilitiesDebt.totalDebt_result).map(strToInt);
      this.expensesLiabilitiesDebtChartOptions.data.datasets[2].label = 'Debt(' + this.company.name + ')'
    }

    if (quickRatioAndCurrentRatio) {
      this.quickRatioAndCurrentRatioChartOptions.show = true;
      this.quickRatioAndCurrentRatioChartOptions.data.labels = Object.keys(quickRatioAndCurrentRatio.quickRatio_result);
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[0].data = Object.values<string>(quickRatioAndCurrentRatio.quickRatio_result).map(strToInt);
      this.quickRatioAndCurrentRatioChartOptions.data.datasets[1].data = Object.values<string>(quickRatioAndCurrentRatio.currentRatio_result).map(strToInt);
    }
  }
  compareModel(content) {
    localStorage.setItem("compareCompany1",this.id1)
    this.modalService.open(content, { size: 'lg' });
  }
  closeModel(){
    localStorage.removeItem("compareCompany1")
  }
  compare(){
    const company2=localStorage.getItem("compareCompany2")
    localStorage.removeItem("compareCompany1")
    localStorage.removeItem("compareCompany2")
    this.router.navigate(["/compareCompany/"+this.id1+"/"+company2])
  }
}
