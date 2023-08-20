import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CountryService } from '@services/data/country.service';
import { OutlookCategoryService } from '@services/data/outlook-category.service';
import { OutlookService } from '@services/data/outlook.service';
import { ChartOption, wrapText } from '@shared/utils/ng2-charts';
import { Chart } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { orderBy, sortBy } from 'lodash-es';
import { firstValueFrom } from 'rxjs';

Chart.register(TreemapController, TreemapElement);

function fmtEnt(entity: any) {
  return { id: entity.id, ...entity.attributes };
}

function NumberToString(number: number) {
  let suffix = '';
  let value = Number(number);

  if (number >= 1000000000000) {
    value = number / 1000000000000;
    suffix = 'tn';
  } else if (number >= 1000000000) {
    value = number / 1000000000;
    suffix = 'bn';
  } else if (number >= 1000000) {
    value = number / 1000000;
    suffix = 'm';
  } else if (number >= 1000) {
    value = number / 1000;
    suffix = 'k';
  }

  return `$${value.toFixed(2)}${suffix}`;
}

@Component({
  selector: 'app-markets',
  templateUrl: './markets.component.html',
})
export class MarketsComponent implements OnInit {
  colors = ['#D9D9D9', '#63B0DB', '#824A68', '#987662', '#A881A1', '#9ADBD3', '#547AA5', '#749659', '#E8933F', '#D36760', '#443F3E'].reverse();
  colorIndex = 0;
  companyRankingOptions = {
    type: 'treemap',
    data: {
      datasets: [
        {
          label: 'Sector Ranking',
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
              return [item.title, NumberToString(item.value)];
            },
            font(context, options) {
              const { data, ctx } = context.chart;
              const item = (data.datasets[context.datasetIndex] as any).tree[context.dataIndex];
              const font = { size: 12, weight: '400', family: 'Inter', lineHeight: 1.2 };
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

  discoverIndustryInsights: any[] = [];
  countryWideLeadingIndustries: any[] = [];

  selectedLeadingCompany: any;
  leadingCompaniesControl = new FormControl();
  leadingCompaniesPaginator = this.outlookService.createPaginator(
    {
      filters: {
        companyDBrevenueChart: { $notNull: true },
      },
      fields: ['name', 'companyDBrevenueChart'],
      sort: ['revenue:desc'],
    },
    { pageSize: 8 }
  );

  outlookCategories: any[] = [];

  constructor(public outlookService: OutlookService, public outlookCategoryService: OutlookCategoryService, private countryService: CountryService) {}

  get leadingCompanies() {
    const companyDBrevenueChart = this.leadingCompaniesControl.value.companyDBrevenueChart;

    const items = Object.entries<string>(companyDBrevenueChart.data)
      .map(([key, value]) => {
        const revenue = sortBy(Object.entries(value), (x) => x[0]).pop()?.[1];
        return { key, revenue, unit: companyDBrevenueChart.unit };
      })
      .filter((x) => x.revenue);

    return orderBy(items, (x) => Number(x.revenue), 'desc');
  }

  async ngOnInit(): Promise<void> {
    this.discoverIndustryInsights = await this.getDiscoverIndustryInsights();
    this.countryWideLeadingIndustries = await this.getCountryWideLeadingIndustries();

    this.outlookCategories = (await this.outlookCategoryService.getAll()).data;

    await this.leadingCompaniesPaginator.load();
    this.selectedLeadingCompany = (await firstValueFrom(this.leadingCompaniesPaginator.data$))[0];
    this.leadingCompaniesControl.patchValue(this.selectedLeadingCompany);

    // this.companyRankingOptions.data.datasets[0].tree = [];

    const data: any[] = [];

    const categories = (await this.outlookCategoryService.getAll()).data.map(fmtEnt);
    for (const [index, category] of categories.entries()) {
      const outlooks = (
        await this.outlookService.getAll({
          fields: ['name', 'revenue'],
          filters: { outlook_category: { id: { $eq: category.id } } },
          pagination: { limit: 6 },
          // sort: ['revenue:desc'],
        })
      ).data.map(fmtEnt);

      for (const outlook of outlooks) {
        data.push({ category: index, title: outlook.name, value: outlook.revenue });
      }
    }

    // this.companyRankingOptions.data.datasets[0].tree = data;
    this.companyRankingOptions.data = {
      datasets: [
        {
          ...this.companyRankingOptions.data.datasets[0],
          tree: data,
        },
      ] as any,
    };
    console.log(data);
  }

  async getDiscoverIndustryInsights() {
    return (
      await this.outlookService.getAll({
        filters: { discoveryWidget: { $eq: true } },
        fields: ['name', 'location', 'revenueChangeTotal'],
        sort: ['revenue:desc'],
      })
    ).data.map(fmtEnt);
  }

  async getCountryWideLeadingIndustries() {
    const countries = (await this.countryService.getAll({ fields: ['name'] })).data.map(fmtEnt);

    for (const country of countries) {
      const outlooks = (
        await this.outlookService.getAll({
          filters: { location: { $eq: country.name } },
          fields: ['name'],
          sort: ['revenue:desc'],
          pagination: { limit: 5 },
        })
      ).data.map(fmtEnt);

      country.outlooks = outlooks;
    }

    return countries;
  }

  async shareProfile() {
    await navigator.share({
      title: 'Share Company Profile',
      url: window.location.href,
    });
  }
}
