import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OutlookCategoryService } from '@services/data/outlook-category.service';
import { OutlookService } from '@services/data/outlook.service';
import { AppChart } from '@v2/components/chart-tabs/chart-tabs.component';
import { ChartConfiguration, ChartType } from 'chart.js';
import { isObject } from 'lodash-es';
import { firstValueFrom, map } from 'rxjs';
import slugify from 'slugify';
import { Papa } from 'ngx-papaparse';
import { formatDate } from '@angular/common';
import { chartWatermark } from '@shared/utils/ng2-charts';
import { CountrySelectComponent } from '@v2/components/country-select/country-select.component';

type ChartOption<T extends ChartType> = Required<ChartConfiguration<T>> & { show?: boolean };

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
})
export class MarketComponent implements OnInit {
  @ViewChild(CountrySelectComponent, { static: true }) countrySelectComponent!: CountrySelectComponent;

  revenueChartOptions = {
    type: 'bar',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          barThickness: 22,
          backgroundColor: '#DDE3EE',
          data: [39, 39, 39, 39, 39, 39],
        },
        {
          barThickness: 22,
          backgroundColor: '#000000',
          data: [40, 40, 40, 40, 40, 40],
        },
        {
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
              size: 14,
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

          // watermark
          chartWatermark(chart);

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
      },
    ],
  } as ChartOption<'bar'>;

  company: any;
  outlook: any;
  charts: Array<AppChart>[] = [];
  loadingExport: boolean = false;
  rMarkets: any;

  outlookCategoryPaginator = this.outlookCategoryService.createPaginator({
    fields: ['name'],
    sort: ['name:asc'],
  });

  outlookCategories$ = this.outlookCategoryPaginator.data$.pipe(
    map((values) =>
      values.map((x) => ({
        ...x,
        name: (x.name as string).replace('Outlook', 'Insights'),
      }))
    )
  );

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private outlookCategoryService: OutlookCategoryService,
    private outlookService: OutlookService,
    private papa: Papa,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const params = await firstValueFrom(this.route.params);
    const id = Number(params['id']);

    this.loading = true;

    await this.outlookCategoryPaginator.load();

    const outlookRes = await this.outlookService.getOne({
      filters: { id: { $eq: id } },
      populate: {
        outlook_category: true,
      },
    });

    this.outlook = { id: outlookRes.data[0].id, ...outlookRes.data[0].attributes };

    this.countrySelectComponent.setCountry(this.outlook.location);
    this.loading = false;

    this.setCharts(this.outlook);

    if (this.outlook.outlook_category.data) {
      await this.outlookCatagory();
    }
  }

  async countryFilter(item: any) {
    this.loading = true;

    const outlookRes = await this.outlookService.getOne({
      filters: { name: { $eq: this.outlook.name }, location: item.name },
    });

    this.router.navigate(['/market', outlookRes.data[0].id, slugify(outlookRes.data[0].attributes.name)]);

    this.loading = false;
  }

  async outlookCatagory() {
    console.log(this.outlook);
    const response = await this.outlookService.getAll({
      filters: { outlook_category: { id: { $eq: this.outlook.outlook_category.data.id } } },
      pagination: { limit: 5 },
    });
    console.log(response);
    this.rMarkets = response.data;
  }

  async export() {
    this.loadingExport = true;

    const outlook = { ...this.outlook };
    // delete entity.logo;
    // if (company.industries) company.industries = company.industries.data[0].attributes.name;

    Object.entries<any>(outlook).forEach(([key, value]) => {
      if (key === 'industries') {
        outlook[key] = value.data[0].attributes.name;
      } else if (key === 'founders') {
        outlook[key] = value.data[0].attributes.fullname;
      } else if (key === 'logo') {
        delete outlook[key];
      } else if (isObject(value)) {
        outlook[key] = JSON.stringify(value);
      }
      if (value == null) {
        delete outlook[key];
      }
    });

    const csv = this.papa.unparse([outlook]);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fileURL = URL.createObjectURL(csvData);

    const ancher = document.createElement('a');
    ancher.style.display = 'none';
    ancher.href = fileURL;
    ancher.download = `${outlook.name} (${formatDate(new Date(), 'd-MMM-y h-mm a', 'en-US')}).csv`;
    ancher.click();

    await new Promise((r) => setTimeout(r, 2000));
    this.loadingExport = false;
  }

  setCharts(o: any) {
    this.charts = [
      [
        { ...o.revenueChart, id: 'revenueChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthChart, id: 'revenueGrowthChart', type: 'line' },
      ],
      [{ ...o.arpuChart, id: 'arpuChart', type: 'line' }],
      [
        { ...o.onlineRevenueShareChart, id: 'onlineRevenueShareChart', type: 'bar', barStacked: true },
        { ...o.revenueYearMobileShareChart, id: 'revenueYearMobileShareChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.revenueShareChart, id: 'revenueShareChart', type: 'bar', barStacked: true }],
      [{ ...o.volumeShareChart, id: 'volumeShareChart', type: 'bar', barStacked: true }],
      [
        { ...o.volumeChart, id: 'volumeChart', type: 'bar', barStacked: true },
        { ...o.volumeGrowthChart, id: 'volumeGrowthChart', type: 'line' },
      ],
      [{ ...o.volumePerCapitaChart, id: 'volumePerCapitaChart', type: 'line' }],
      [{ ...o.pricePerUnitChart, id: 'pricePerUnitChart', type: 'line' }],
      [{ ...o.globalRevenueChart, id: 'globalRevenueChart', type: 'bar', barStacked: true, legend: false }],
      [{ ...o.revenueBrandChart, id: 'revenueBrandChart', type: 'bar', barStacked: true }],
      [
        { ...o.volumePerCapitaAChart, id: 'volumePerCapitaAChart', type: 'bar', barStacked: true },
        { ...o.volumePerCapitaBChart, id: 'volumePerCapitaBChart', type: 'bar', barStacked: true },
        { ...o.volumePerCapitaCChart, id: 'volumePerCapitaCChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.outOfHomeRevenueChart, id: 'outOfHomeRevenueChart', type: 'bar', barStacked: true }],
      [
        { ...o.salesChannelOnlineChart, id: 'salesChannelOnlineChart', type: 'bar', barStacked: true },
        { ...o.salesChannelOfflineChart, id: 'salesChannelOfflineChart', type: 'bar', barStacked: true },
      ],
      [
        { ...o.salesChannelExpenditureOnlineChart, id: 'salesChannelExpenditureOnlineChart', type: 'bar', barStacked: true },
        { ...o.salesChannelExpenditureOfflineChart, id: 'salesChannelExpenditureOfflineChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.luxuryRevenueShareChart, id: 'luxuryRevenueShareChart', type: 'bar', barStacked: true }],
      [{ ...o.secondhandShareChart, id: 'secondhandShareChart', type: 'bar', barStacked: true }],
      [{ ...o.sustainableShareChart, id: 'sustainableShareChart', type: 'bar', barStacked: true }],
      [{ ...o.ageChart, id: 'ageChart', type: 'bar', barStacked: true }],
      [{ ...o.incomeChart, id: 'incomeChart', type: 'bar', barStacked: true }],
      [{ ...o.genderChart, id: 'genderChart', type: 'bar', barStacked: true }],
      [{ ...o.smartphoneShareChart, id: 'smartphoneShareChart', type: 'bar', barStacked: true }],
      [{ ...o.companyDBrevenueChart, id: 'companyDBrevenueChart', type: 'bar', barStacked: true }],
      [{ ...o.revenueCompetitorChart, id: 'revenueCompetitorChart', type: 'bar', barStacked: true }],
      [
        { ...o.revenueMobileSplitChart, id: 'revenueMobileSplitChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthMobileSplitChart, id: 'revenueGrowthMobileSplitChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.downloadsChart, id: 'downloadsChart', type: 'bar', barStacked: true }],
      [{ ...o.usageTimeAppChart, id: 'usageTimeAppChart', type: 'bar', barStacked: true }],
      [
        { ...o.usageTimeAppAgeGenderAllChart, id: 'usageTimeAppAgeGenderAllChart', type: 'bar', barStacked: true },
        { ...o.usageTimeAppAgeGenderZeroChart, id: 'usageTimeAppAgeGenderZeroChart', type: 'bar', barStacked: true },
        { ...o.usageTimeAppAgeGenderTwentyChart, id: 'usageTimeAppAgeGenderTwentyChart', type: 'bar', barStacked: true },
        { ...o.usageTimeAppAgeGenderTwentyFiveChart, id: 'usageTimeAppAgeGenderTwentyFiveChart', type: 'bar', barStacked: true },
        { ...o.usageTimeAppAgeGenderThirtyChart, id: 'usageTimeAppAgeGenderThirtyChart', type: 'bar', barStacked: true },
        { ...o.usageTimeAppAgeGenderThirtyFiveChart, id: 'usageTimeAppAgeGenderThirtyFiveChart', type: 'bar', barStacked: true },
        { ...o.usageTimeAppAgeGenderFortyChart, id: 'usageTimeAppAgeGenderFortyChart', type: 'bar', barStacked: true },
        { ...o.usageTimeAppAgeGenderFortyFiveChart, id: 'usageTimeAppAgeGenderFortyFiveChart', type: 'bar', barStacked: true },
        { ...o.usageTimeAppAgeGenderFiftyChart, id: 'usageTimeAppAgeGenderFiftyChart', type: 'bar', barStacked: true },
      ],
      [
        { ...o.revenueDesktopMobileShareChart, id: 'revenueDesktopMobileShareChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthDesktopMobileShareChart, id: 'revenueGrowthDesktopMobileShareChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.revenueDesktopSplitChart, id: 'revenueDesktopSplitChart', type: 'bar', barStacked: true }],
      [
        { ...o.revenueSocialMediaChart, id: 'revenueSocialMediaChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthSocialMediaChart, id: 'revenueGrowthSocialMediaChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.revenueSocialMediaDigitalShareChart, id: 'revenueSocialMediaDigitalShareChart', type: 'bar', barStacked: true }],
      [
        { ...o.revenueProgrammaticShareChart, id: 'revenueProgrammaticShareChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthProgrammaticShareChart, id: 'revenueGrowthProgrammaticShareChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.revenueIndustryShareChart, id: 'revenueIndustryShareChart', type: 'bar', barStacked: true }],
      [
        { ...o.globalRevenueMobileSplitChart, id: 'globalRevenueMobileSplitChart', type: 'bar', barStacked: true },
        { ...o.globalRevenueDesktopSplitChart, id: 'globalRevenueDesktopSplitChart', type: 'bar', barStacked: true },
      ],
      [
        { ...o.revenueConnectedTVChart, id: 'revenueConnectedTVChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthConnectedTVChart, id: 'revenueGrowthConnectedTVChart', type: 'bar', barStacked: true },
      ],
      [
        { ...o.revenueTotalChart, id: 'revenueTotalChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthTotalChart, id: 'revenueGrowthTotalChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.globalRevenueConnectedTVChart, id: 'globalRevenueConnectedTVChart', type: 'bar', barStacked: true }],
      [{ ...o.globalRevenueTotalChart, id: 'globalRevenueTotalChart', type: 'bar', barStacked: true }],
      [{ ...o.usersSocialMediaChart, id: 'usersSocialMediaChart', type: 'bar', barStacked: true }],
      [{ ...o.globalRevenueSocialMediaChart, id: 'globalRevenueSocialMediaChart', type: 'bar', barStacked: true }],
      [{ ...o.usersChart, id: 'usersChart', type: 'bar', barStacked: true }],
      [{ ...o.usersPenetrationChart, id: 'usersPenetrationChart', type: 'bar', barStacked: true }],
      [{ ...o.globalUsersPenetrationChart, id: 'globalUsersPenetrationChart', type: 'bar', barStacked: true }],
      [
        { ...o.revenueAUMChart, id: 'revenueAUMChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthAUMChart, id: 'revenueGrowthAUMChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.arpuAUMChart, id: 'arpuAUMChart', type: 'bar', barStacked: true }],
      [{ ...o.globalRevenueAUMChart, id: 'globalRevenueAUMChart', type: 'bar', barStacked: true }],
      [{ ...o.productPenetrationChart, id: 'productPenetrationChart', type: 'bar', barStacked: true }],
      [{ ...o.volumeBrandChart, id: 'volumeBrandChart', type: 'bar', barStacked: true }],
      [{ ...o.volumeCompetitorChart, id: 'volumeCompetitorChart', type: 'bar', barStacked: true }],
      [{ ...o.connectedShareChart, id: 'connectedShareChart', type: 'bar', barStacked: true }],
      [{ ...o.fuelVolumeShareChart, id: 'fuelVolumeShareChart', type: 'bar', barStacked: true }],
      [{ ...o.autonomousShareChart, id: 'autonomousShareChart', type: 'bar', barStacked: true }],
      [{ ...o.emissionsAverageChart, id: 'emissionsAverageChart', type: 'bar', barStacked: true }],
      [{ ...o.volumeStationsChart, id: 'volumeStationsChart', type: 'bar', barStacked: true }],
      [
        { ...o.revenueEvIfChart, id: 'revenueEvIfChart', type: 'bar', barStacked: true },
        { ...o.revenueGrowthEvIfChart, id: 'revenueGrowthEvIfChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.revenuePerStationChart, id: 'revenuePerStationChart', type: 'bar', barStacked: true }],
      [{ ...o.revenuePerEvChart, id: 'revenuePerEvChart', type: 'bar', barStacked: true }],
      [{ ...o.electricShareChart, id: 'electricShareChart', type: 'bar', barStacked: true }],
      [{ ...o.spendPerEmployeeChart, id: 'spendPerEmployeeChart', type: 'bar', barStacked: true }],
      [{ ...o.osShareChart, id: 'osShareChart', type: 'bar', barStacked: true }],
      [{ ...o.companyShareChart, id: 'companyShareChart', type: 'bar', barStacked: true }],
      [{ ...o.estimatedCostChart, id: 'estimatedCostChart', type: 'bar', barStacked: true }],
      [{ ...o.hospitalDensityChart, id: 'hospitalDensityChart', type: 'bar', barStacked: true }],
      [{ ...o.revenuePerHospitalChart, id: 'revenuePerHospitalChart', type: 'bar', barStacked: true }],
      [{ ...o.hospitalBedsChart, id: 'hospitalBedsChart', type: 'bar', barStacked: true }],
      [{ ...o.hospitalBedDensityChart, id: 'hospitalBedDensityChart', type: 'bar', barStacked: true }],
      [{ ...o.revenuePerHospitalBedChart, id: 'revenuePerHospitalBedChart', type: 'bar', barStacked: true }],
      [{ ...o.numberEnterprisesChart, id: 'numberEnterprisesChart', type: 'bar', barStacked: true }],
      [{ ...o.numberEnterprisesBySizeGroupChart, id: 'numberEnterprisesBySizeGroupChart', type: 'bar', barStacked: true }],
      [{ ...o.gniTotalChart, id: 'gniTotalChart', type: 'bar', barStacked: true }],
      [{ ...o.gniCapitaChart, id: 'gniCapitaChart', type: 'bar', barStacked: true }],
      [{ ...o.gniGrowthChart, id: 'gniGrowthChart', type: 'bar', barStacked: true }],
      [{ ...o.inflationChart, id: 'inflationChart', type: 'bar', barStacked: true }],
      [{ ...o.investmentsTotalChart, id: 'investmentsTotalChart', type: 'bar', barStacked: true }],
      [{ ...o.investmentShareChart, id: 'investmentShareChart', type: 'bar', barStacked: true }],
      [{ ...o.investmentGrowthChart, id: 'investmentGrowthChart', type: 'bar', barStacked: true }],
      [{ ...o.globalCorruptionControlChart, id: 'globalCorruptionControlChart', type: 'bar', barStacked: true }],
      [{ ...o.gdpTotalChart, id: 'gdpTotalChart', type: 'bar', barStacked: true }],
      [{ ...o.gdpCapitaChart, id: 'gdpCapitaChart', type: 'bar', barStacked: true }],
      [{ ...o.gdpGrowthChart, id: 'gdpGrowthChart', type: 'bar', barStacked: true }],
      [{ ...o.exchangeRateChart, id: 'exchangeRateChart', type: 'bar', barStacked: true }],
      [{ ...o.centralBankInterestChart, id: 'centralBankInterestChart', type: 'bar', barStacked: true }],
      [{ ...o.annualWagesAverageChart, id: 'annualWagesAverageChart', type: 'bar', barStacked: true }],
      [{ ...o.employmentIndustryChart, id: 'employmentIndustryChart', type: 'bar', barStacked: true }],
      [{ ...o.employmentServicesChart, id: 'employmentServicesChart', type: 'bar', barStacked: true }],
      [{ ...o.employmentAgricultureChart, id: 'employmentAgricultureChart', type: 'bar', barStacked: true }],
      [{ ...o.educationalBackgroundChart, id: 'educationalBackgroundChart', type: 'bar', barStacked: true }],
      [{ ...o.unemploymentRateChart, id: 'unemploymentRateChart', type: 'bar', barStacked: true }],
      [{ ...o.globalUnemploymentRateChart, id: 'globalUnemploymentRateChart', type: 'bar', barStacked: true }],
      [{ ...o.laborForceAgeChart, id: 'laborForceAgeChart', type: 'bar', barStacked: true }],
      [{ ...o.laborForceGenderChart, id: 'laborForceGenderChart', type: 'bar', barStacked: true }],
      [{ ...o.industryForecastChart, id: 'industryForecastChart', type: 'bar', barStacked: true }],
      [{ ...o.changesImportChart, id: 'changesImportChart', type: 'bar', barStacked: true }],
      [{ ...o.changesExportChart, id: 'changesExportChart', type: 'bar', barStacked: true }],
      [{ ...o.globalCompetitiveIndexChart, id: 'globalCompetitiveIndexChart', type: 'bar', barStacked: true }],
      [{ ...o.inwardInvestmentChart, id: 'inwardInvestmentChart', type: 'bar', barStacked: true }],
      [{ ...o.outwardInvestmentChart, id: 'outwardInvestmentChart', type: 'bar', barStacked: true }],
      [{ ...o.marketShareChart, id: 'marketShareChart', type: 'bar', barStacked: true }],
      [
        { ...o.digitalRevenueChart, id: 'digitalRevenueChart', type: 'bar', barStacked: true },
        { ...o.digitalRevenueGrowthChart, id: 'digitalRevenueGrowthChart', type: 'bar', barStacked: true },
      ],
      [{ ...o.broadbandSubscriptionsChart, id: 'broadbandSubscriptionsChart', type: 'bar', barStacked: true }],
      [{ ...o.mobileSubscriptionsChart, id: 'mobileSubscriptionsChart', type: 'bar', barStacked: true }],
      [{ ...o.internetPenetrationChart, id: 'internetPenetrationChart', type: 'bar', barStacked: true }],
      [{ ...o.globalInternetPenetrationChart, id: 'globalInternetPenetrationChart', type: 'bar', barStacked: true }],
      [{ ...o.householdsChart, id: 'householdsChart', type: 'bar', barStacked: true }],
      [{ ...o.purchasingPowerChart, id: 'purchasingPowerChart', type: 'bar', barStacked: true }],
      [{ ...o.brandAwarenessLowChart, id: 'brandAwarenessLowChart', type: 'bar', barStacked: true }],
      [{ ...o.brandAwarenessMediumChart, id: 'brandAwarenessMediumChart', type: 'bar', barStacked: true }],
      [{ ...o.brandAwarenessHighChart, id: 'brandAwarenessHighChart', type: 'bar', barStacked: true }],
      [{ ...o.globalHumanDevelopmentChart, id: 'globalHumanDevelopmentChart', type: 'bar', barStacked: true }],
      [{ ...o.totalPopulationChart, id: 'totalPopulationChart', type: 'bar', barStacked: true }],
      [{ ...o.urbanPopulationChart, id: 'urbanPopulationChart', type: 'bar', barStacked: true }],
      [{ ...o.publicEmploymentChart, id: 'publicEmploymentChart', type: 'bar', barStacked: true }],
      [{ ...o.healthcareSpendingChart, id: 'healthcareSpendingChart', type: 'bar', barStacked: true }],
      [{ ...o.globalLogisticsPerformanceChart, id: 'globalLogisticsPerformanceChart', type: 'bar', barStacked: true }],
      [{ ...o.governmentExpenditureChart, id: 'governmentExpenditureChart', type: 'bar', barStacked: true }],
      [{ ...o.governmentRevenueChart, id: 'governmentRevenueChart', type: 'bar', barStacked: true }],
      [{ ...o.governmentDebtCoChart, id: 'governmentDebtCoChart', type: 'bar', barStacked: true }],
      [{ ...o.coEmissionsChart, id: 'coEmissionsChart', type: 'bar', barStacked: true }],
      [{ ...o.energyShareChart, id: 'energyShareChart', type: 'bar', barStacked: true }],
      [{ ...o.globalExposurePMChart, id: 'globalExposurePMChart', type: 'bar', barStacked: true }],
      [{ ...o.mortalityRateChart, id: 'mortalityRateChart', type: 'bar', barStacked: true }],
      [{ ...o.lifeExpectancyChart, id: 'lifeExpectancyChart', type: 'bar', barStacked: true }],
      [{ ...o.totalHealthCareSpendingChart, id: 'totalHealthCareSpendingChart', type: 'bar', barStacked: true }],
      [{ ...o.numberOfSmokersChart, id: 'numberOfSmokersChart', type: 'bar', barStacked: true }],
      [{ ...o.smokingbyGenderFemaleChart, id: 'smokingbyGenderFemaleChart', type: 'bar', barStacked: true }],
      [{ ...o.smokingbyGenderMaleChart, id: 'smokingbyGenderMaleChart', type: 'bar', barStacked: true }],
      [{ ...o.hospitalBedsCapitaChart, id: 'hospitalBedsCapitaChart', type: 'bar', barStacked: true }],
      [{ ...o.hospitalsPer100kInhabitantsChart, id: 'hospitalsPer100kInhabitantsChart', type: 'bar', barStacked: true }],
      [{ ...o.physicianDensityCapitaChart, id: 'physicianDensityCapitaChart', type: 'bar', barStacked: true }],
      [{ ...o.climateRiskChart, id: 'climateRiskChart', type: 'bar', barStacked: true }],
      [{ ...o.worldRiskChart, id: 'worldRiskChart', type: 'bar', barStacked: true }],
      [{ ...o.globalHealthSecurityChart, id: 'globalHealthSecurityChart', type: 'bar', barStacked: true }],
      [{ ...o.rcgHealthChart, id: 'rcgHealthChart', type: 'bar', barStacked: true }],
      [{ ...o.globalTerrorismChart, id: 'globalTerrorismChart', type: 'bar', barStacked: true }],
      [{ ...o.globalPeaceChart, id: 'globalPeaceChart', type: 'bar', barStacked: true }],
      [{ ...o.worldHappinessChart, id: 'worldHappinessChart', type: 'bar', barStacked: true }],
      [{ ...o.digitalChart, id: 'digitalChart', type: 'bar', barStacked: true }],
      [{ ...o.mobileConnectivityChart, id: 'mobileConnectivityChart', type: 'bar', barStacked: true }],
      [{ ...o.globalCybersecurityChart, id: 'globalCybersecurityChart', type: 'bar', barStacked: true }],
      [{ ...o.globalInnovationChart, id: 'globalInnovationChart', type: 'bar', barStacked: true }],
      [{ ...o.ruleofLawChart, id: 'ruleofLawChart', type: 'bar', barStacked: true }],
    ];
  }

  async share() {
    await navigator.share({
      title: 'Share Market',
      url: window.location.href,
    });
  }
}
