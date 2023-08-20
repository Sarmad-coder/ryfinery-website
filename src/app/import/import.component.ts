import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '@env';
import { CompanyService } from '@services/data/company.service';
import { CompanyTypeService } from '@services/data/company_type.service';
import { FounderService } from '@services/data/founder.service';
import { FundingStageService } from '@services/data/funding-stage.service';
import { FundingTypeService } from '@services/data/funding-type.service';
import { FundingService } from '@services/data/funding.service';
import { InvestorStageService } from '@services/data/investor-stage.service';
import { InvestorTypeService } from '@services/data/investor-type.service';
import { InvestorService } from '@services/data/investor.service';
import { BaseDataService } from '@shared/BaseDataService';
import { isEmpty } from '@shared/utils/is-empty';
import { flatten, isArray, isString, omitBy, uniq, uniqBy, uniqWith } from 'lodash-es';
import { Papa, ParseConfig, ParseResult } from 'ngx-papaparse';
import { firstValueFrom } from 'rxjs';
import * as uuid from 'uuid';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
  companyAttributes: any = [];
  url = environment.apiUrl;
  new = 0;

  constructor(
    private papa: Papa,
    private http: HttpClient,
    private founderService: FounderService,
    private companyService: CompanyService,
    private investorService: InvestorService,
    private investorTypeService: InvestorTypeService,
    private investorStageService: InvestorStageService,
    private companyTypeService: CompanyTypeService,
    private fundingService: FundingService,
    private fundingTypeService: FundingTypeService,
    private fundingStageService: FundingStageService
  ) {}

  async ngOnInit() {
    // this.importFundingStages();
    // this.importFundingStages();
    // this.importFundings();
    // this.importInvestors();
  }

  //#region Saif's code

  async connectFounderWithCompany() {
    for (const [index, _] of Array(25).fill(0).entries()) {
      const companies = await this.companyService.getAll({
        fields: ['name'],
        pagination: { page: index + 1, pageSize: 500 },
      });

      for (const [_index, company] of companies.data.entries()) {
        const founders = await this.founderService.getAll({
          fields: ['id'],
          filters: { currentCompany: { $eqi: company.attributes.name } },
        });

        if (!founders.data.length) continue;

        const founderIds = founders.data.map((x) => x.id);
        await this.companyService.update(company.id, { founders: founderIds });
        console.log('company updated', 500 * (_index + 1), company.attributes.name, founderIds);
      }
    }
  }

  async importFounders() {
    const path = 'assets/csv/moreData/United Arab Emirates/People.csv';
    const entities = await this.readCsv(path, (arr) =>
      arr.map((x) => ({
        firstName: x['First Name'],
        lastName: x['Last Name'],
        fullname: x['Full Name'],
        gender: x['Gender'],
        position: x['Primary Job Title'],
        bio: x['Biography'],
        company: x['Primary Organization'],
        currentCompany: x['Primary Organization'],
        linkedin: x['LinkedIn'],
        twitter: x['Twitter'],
        cbUrl: x['Name Url'],
        cbRank: x['CB Rank (Person)'],
        address: x['Location'] == x['Location 1'] ? x['Location'] : `${x['Location']}', ${x['Location 1']}`,
        country: 'United Arab Emirates',
        regions: 'Gulf Cooperation Council (GCC)',
      }))
    );

    if (!entities.length) return;

    console.log(`Founder`, 'Import Started.', 'File:', path);

    for (const [index, entity] of entities.entries()) {
      await this.founderService.create(entity); // add entity to database
      console.log(`Founder`, 'added:', index + 1);
    }

    console.log(`Founder`, 'Import Completed.', 'File:', path);
  }

  async importInvestorTypes() {
    const dataMap = (arr: any[]) => {
      const result = arr.map((x) => {
        const ee = (x['Investor Type'] as string).split(',');

        return ee.map((v) => ({ name: v }));
      });

      return flatten(result);
    };

    const c2021 = await this.readCsv('assets/csv/investors-9-28-2021.csv', dataMap);
    const bahrain = await this.readCsv('assets/csv/moreData/Bahrain/Investor.csv', dataMap);
    const kuwait = await this.readCsv('assets/csv/moreData/Kuwait/Investor.csv', dataMap);
    const oman = await this.readCsv('assets/csv/moreData/Oman/Investor.csv', dataMap);
    const qatar = await this.readCsv('assets/csv/moreData/Qatar/Investor.csv', dataMap);
    const saudiArabia = await this.readCsv('assets/csv/moreData/Saudi Arabia/Investor.csv', dataMap);
    const uae = await this.readCsv('assets/csv/moreData/United Arab Emirates/Investor.csv', dataMap);
    const entities = uniqBy([...c2021, ...bahrain, ...kuwait, ...oman, ...qatar, ...saudiArabia, ...uae], 'name');

    const db = await this.investorTypeService.getAll({ fields: ['name'], pagination: { pageSize: 1, limit: 1000 } });
    const dbEntities = db.data.map((x) => ({ id: x.id, ...x.attributes }));

    // remove duplicate entities
    dbEntities.forEach((x) => {
      const index = entities.findIndex((y) => y.name === x.name);
      if (index > -1) {
        entities.splice(index, 1);
      }
    });

    console.log(`'Investor Type'`, 'Import Started.');

    for (const [index, entity] of entities.entries()) {
      await this.investorTypeService.create(entity); // add entity to database
      console.log(`'Investor Type'`, 'added:', index + 1);
    }

    console.log(`'Investor Type'`, 'Import Completed.');
  }

  async importInvestorStages() {
    const dataMap = (arr: any[]) => {
      const result = arr.map((x) => {
        const ee = (x['Investment Stage'] as string).split(',');
        return ee.map((v) => ({ name: v }));
      });

      return flatten(result);
    };

    const c2021 = await this.readCsv('assets/csv/investors-9-28-2021.csv', dataMap);
    const bahrain = await this.readCsv('assets/csv/moreData/Bahrain/Investor.csv', dataMap);
    const kuwait = await this.readCsv('assets/csv/moreData/Kuwait/Investor.csv', dataMap);
    const oman = await this.readCsv('assets/csv/moreData/Oman/Investor.csv', dataMap);
    const qatar = await this.readCsv('assets/csv/moreData/Qatar/Investor.csv', dataMap);
    const saudiArabia = await this.readCsv('assets/csv/moreData/Saudi Arabia/Investor.csv', dataMap);
    const uae = await this.readCsv('assets/csv/moreData/United Arab Emirates/Investor.csv', dataMap);
    const entities = uniqBy([...c2021, ...bahrain, ...kuwait, ...oman, ...qatar, ...saudiArabia, ...uae], 'name');

    const db = await this.investorStageService.getAll({ fields: ['name'], pagination: { limit: 1000 } });
    const dbEntities = db.data.map((x) => ({ id: x.id, ...x.attributes }));

    // remove duplicate entities
    dbEntities.forEach((x) => {
      const index = entities.findIndex((y) => y.name === x.name);
      if (index > -1) {
        entities.splice(index, 1);
      }
    });

    console.log(`Investor Stage`, 'Import Started.');

    for (const [index, entity] of entities.entries()) {
      await this.investorTypeService.create(entity); // add entity to database
      console.log(`Investor Stage`, 'added:', index + 1);
    }

    console.log(`Investor Stage`, 'Import Completed.');
  }

  async importInvestors() {
    const dataMap = (entities: Record<string, string>[]) =>
      entities.map((x) => ({
        name: x['Organization/Person Name'],
        cbUrl: x['Organization/Person Url'],
        cbRank: x['CB Rank (Investor)'],
        region: 'Gulf Cooperation Council (GCC)',
        address: [x['Location'], x['Location 2']].filter((x) => x).join(', '),
        bio: x['Description'],
        description: x['Full Description'],
        position: x['Primary Job Title'],
        gender: x['Gender'],
        investor_types: x['Investor Type']?.split(','),
        investor_stages: x['Investment Stage']?.split(','),
        company_type: x['Company Type'],
        email: x['Contact Email'],
        phone: x['Phone Number'],
        website: x['Website'],
        facebook: x['facebook'],
        linkedIn: x['linkedIn'],
        twitter: x['twitter'],
        ipoStatus: x['IPO Status'],
        noOfInvestments: Number(x['Number of Investments']),
        noOfExits: Number(x['Number of Exits']),
      }));

    const c2021 = await this.readCsv('assets/csv/investors-9-28-2021.csv', dataMap);
    const bahrain = await this.readCsv('assets/csv/moreData/Bahrain/Investor.csv', dataMap);
    const kuwait = await this.readCsv('assets/csv/moreData/Kuwait/Investor.csv', dataMap);
    const oman = await this.readCsv('assets/csv/moreData/Oman/Investor.csv', dataMap);
    const qatar = await this.readCsv('assets/csv/moreData/Qatar/Investor.csv', dataMap);
    const saudiArabia = await this.readCsv('assets/csv/moreData/Saudi Arabia/Investor.csv', dataMap);
    const uae = await this.readCsv('assets/csv/moreData/United Arab Emirates/Investor.csv', dataMap);
    const investors = uniqBy([...c2021, ...bahrain, ...kuwait, ...oman, ...qatar, ...saudiArabia, ...uae], 'name').filter((x) => x.name); // remove duplicates by name

    const dbInvestors = await this.getAllEntities(this.investorService, { fields: ['name'] });

    // set db entities with new data in investors array, later it will just update, instead of add
    dbInvestors.forEach((x) => {
      const index = investors.findIndex((y) => y.name === x.name);
      if (index > -1) {
        investors.splice(index, 1);
        investors.push({ ...investors[index], ...x });
      }
    });

    const types = await this.getAllEntities(this.investorTypeService, { fields: ['name'] });
    const stages = await this.getAllEntities(this.investorStageService, { fields: ['name'] });
    const companyTypes = await this.getAllEntities(this.companyTypeService, { fields: ['name'] });

    for (const entity of investors) {
      // const _types = types.filter((x) => (entity.investor_types as string[])?.includes(x.name));
      // if (_types.length) entity.investor_types = _types.map((x) => x.id);

      // const _stages = stages.filter((x) => (entity.investor_stages as string[])?.includes(x.name));
      // if (_stages.length) entity.investor_stages = _stages.map((x) => x.id);

      // const companyType = companyTypes.find((x) => x.name === entity.company_type);
      // if (companyType) entity.company_type = companyType.id;

      if (entity.investor_types?.length)
        entity.investor_types = await Promise.all((entity.investor_types as string[])?.map((x) => this.getRelationId(this.investorTypeService, x, true)));

      if (entity.investor_stages?.length)
        entity.investor_stages = await Promise.all((entity.investor_stages as string[])?.map((x) => this.getRelationId(this.investorStageService, x, true)));

      if (entity.company_type) entity.company_type = await this.getRelationId(this.companyTypeService, entity.company_type);
    }

    // console.log(investors);
    // return;

    console.log(`Investor`, 'Import Started.');

    for (const [index, entity] of investors.entries()) {
      if (entity.id) {
        await this.investorService.update(entity.id, entity); // update entity to database
        console.log(`Investor`, 'updated:', index + 1);
      } else {
        await this.investorService.create(entity); // add entity to database
        console.log(`Investor`, 'added:', index + 1);
      }
    }

    console.log(`Investor`, 'Import Completed.');
  }

  async importFundingTypes() {
    const dataMap = (arr: any[]) => arr.map((x) => ({ name: x['Funding Type'] }));

    const fund2021 = await this.readCsv('assets/csv/funding-rounds-9-28-2021.csv', dataMap);
    const bahrain = await this.readCsv('assets/csv/moreData/Bahrain/Funding Round.csv', dataMap);
    const kuwait = await this.readCsv('assets/csv/moreData/Kuwait/Funding Round.csv', dataMap);
    const oman = await this.readCsv('assets/csv/moreData/Oman/Funding Round.csv', dataMap);
    const qatar = await this.readCsv('assets/csv/moreData/Qatar/Funding Round.csv', dataMap);
    const saudiArabia = await this.readCsv('assets/csv/moreData/Saudi Arabia/Funding Round.csv', dataMap);
    const uae = await this.readCsv('assets/csv/moreData/United Arab Emirates/Funding Round.csv', dataMap);
    const entities = uniqBy([...fund2021, ...bahrain, ...kuwait, ...oman, ...qatar, ...saudiArabia, ...uae], 'name');

    console.log(`Funding Type`, 'Import Started.');

    for (const [index, entity] of entities.entries()) {
      await this.fundingTypeService.create(entity); // add entity to database
      console.log(`Funding Type`, 'added:', index + 1);
    }

    console.log(`Funding Type`, 'Import Completed.');
  }

  async importFundingStages() {
    const dataMap = (arr: any[]) => arr.map((x) => ({ name: x['Funding Stage'] }));

    const fund2021 = await this.readCsv('assets/csv/funding-rounds-9-28-2021.csv', dataMap);
    const bahrain = await this.readCsv('assets/csv/moreData/Bahrain/Funding Round.csv', dataMap);
    const kuwait = await this.readCsv('assets/csv/moreData/Kuwait/Funding Round.csv', dataMap);
    const oman = await this.readCsv('assets/csv/moreData/Oman/Funding Round.csv', dataMap);
    const qatar = await this.readCsv('assets/csv/moreData/Qatar/Funding Round.csv', dataMap);
    const saudiArabia = await this.readCsv('assets/csv/moreData/Saudi Arabia/Funding Round.csv', dataMap);
    const uae = await this.readCsv('assets/csv/moreData/United Arab Emirates/Funding Round.csv', dataMap);
    const entities = uniqBy([...fund2021, ...bahrain, ...kuwait, ...oman, ...qatar, ...saudiArabia, ...uae], 'name');

    console.log([...fund2021, ...bahrain, ...kuwait, ...oman, ...qatar, ...saudiArabia, ...uae]);
    console.log(entities);

    console.log(`Funding Stage`, 'Import Started.');

    for (const [index, entity] of entities.entries()) {
      await this.fundingStageService.create(entity); // add entity to database
      console.log(`Funding Stage`, 'added:', index + 1);
    }

    console.log(`Funding Stage`, 'Import Completed.');
  }

  async importFundings() {
    const dataMap = (entities: Record<string, string>[]) =>
      entities.map((x) => ({
        transactionName: x['Transaction Name'],
        company: x['Organization Name'],
        cbUrl: x['Organization Url'] || x['Organization Name URL'],
        investors: [x['Investor Names'], x['Investor Names 1']],
        fundingType: x['Funding Type'],
        fundingStage: x['Funding Stage'],
        moneyRaised: x['Money Raised'],
        announcedDate: new Date(x['Announced Date']),
        preMoneyValuation: x['Pre-Money Valuation'],
        equityOnlyFunding: x['Equity Only Funding']?.trim() === 'Yes',
        companyRevenueRange: x['Organization Revenue Range'],
        totalFundingAmount: x['Total Funding Amount'],
      }));

    const fund2021 = await this.readCsv('assets/csv/funding-rounds-9-28-2021.csv', dataMap);
    const bahrain = await this.readCsv('assets/csv/moreData/Bahrain/Funding Round.csv', dataMap);
    const kuwait = await this.readCsv('assets/csv/moreData/Kuwait/Funding Round.csv', dataMap);
    const oman = await this.readCsv('assets/csv/moreData/Oman/Funding Round.csv', dataMap);
    const qatar = await this.readCsv('assets/csv/moreData/Qatar/Funding Round.csv', dataMap);
    const saudiArabia = await this.readCsv('assets/csv/moreData/Saudi Arabia/Funding Round.csv', dataMap);
    const uae = await this.readCsv('assets/csv/moreData/United Arab Emirates/Funding Round.csv', dataMap);
    const entities = [...fund2021, ...bahrain, ...kuwait, ...oman, ...qatar, ...saudiArabia, ...uae];

    const companies = await this.getAllEntities(this.companyService, { fields: ['cbUrl'] });
    // const investors = await this.getAllEntities(this.investorService, { fields: ['name'] });
    // const types = await this.getAllEntities(this.fundingTypeService, { fields: ['name'] });
    // const stages = await this.getAllEntities(this.fundingStageService, { fields: ['name'] });

    const dataToAdd: any[] = [];

    for (const entity of entities) {
      const _company = companies.find((x) => x.cbUrl === entity.cbUrl);
      if (_company) entity.company = _company.id;
      else continue;

      if (entity.investors?.length)
        entity.investors = await Promise.all((entity.investors as string[])?.map((x) => this.getRelationId(this.investorService, x, true)));

      if (entity.fundingType) entity.fundingType = await this.getRelationId(this.fundingTypeService, entity.fundingType);
      if (entity.fundingStage) entity.fundingStage = await this.getRelationId(this.fundingStageService, entity.fundingStage);

      dataToAdd.push(entity);
    }

    console.log(dataToAdd);
    console.log(`Funding`, 'Import Started.');

    for (const [index, entity] of dataToAdd.entries()) {
      console.log(entity);
      await this.fundingService.create(entity); // add entity to database
      console.log(`Funding`, 'added:', index + 1);
    }

    console.log(`Funding`, 'Import Completed.');
  }

  private async readCsv(csvPath: string, dataMap: (entity: Record<string, string>[]) => any[]) {
    const csv = await firstValueFrom(this.http.get(csvPath, { responseType: 'text' }));

    const parseResult = await new Promise<ParseResult>((resolve, reject) => {
      this.papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        worker: true,
        complete: (result) => resolve(result),
        error: (error) => {
          reject(error), console.log(`error when parsing: ${error}`);
        },
      });
    });

    const parseErrors: string[] = parseResult.errors.map((x) => `${x.type} (${x.code}): row: ${x.row}, ${x.message}`);
    if (parseErrors.length) {
      console.error('Error:', parseErrors);
      throw new Error('');
    }

    // const parseColumns: string[] = parseResult.meta.fields;
    // console.log(`[${name}]`, 'Columns:', parseColumns);

    const parseEntities: any[] = parseResult.data.filter((x) => !isEmpty(omitBy(x, (x) => isEmpty(x)))); // remove empty rows

    let entities = dataMap(parseEntities);

    // format values
    entities.forEach((entity) => {
      Object.keys(entity).forEach((key) => {
        entity[key] = this.formatValue(entity[key]);
        if (isEmpty(entity[key])) delete entity[key]; // delete field if empty
      });
    });

    entities = entities.filter((x) => !isEmpty(omitBy(x, (y) => isEmpty(y, { skipBoolean: true })))); // remove empty objects

    // console.log(`[${name}]`, 'Entites:', entities);

    return entities;
  }

  private async getRelationId(service: BaseDataService, name: string, addIfNotFound?: boolean): Promise<number> {
    const response = await service.getOne({ filters: { name: { $eq: name } } });
    const entities = response.data.map((x) => ({ id: x.id, ...x.attributes }));

    if (!entities.length && addIfNotFound) {
      const { data } = await service.create({ name });
      return data.id;
    }

    return entities[0]?.id || undefined;
  }

  private async getAllEntities(service: BaseDataService, query: any) {
    const result: any[] = [];

    for (var i = 0; i < Infinity; i++) {
      const response = await service.getAll({ ...query, pagination: { page: i + 1, pageSize: 100 } });
      const entities = response.data.map((x) => ({ id: x.id, ...x.attributes }));

      if (!entities.length) break;

      result.push(...entities);
    }

    return result;
  }

  private formatValue(value: any) {
    if (isString(value)) {
      value = this.replaceAll(value, '�', '');
      value = this.replaceAll(value, '?', '');
      value = value.trim();

      if (value === '—') value = null;
      //
    } else if (isArray(value)) {
      value = value.map((x) => this.formatValue(x)).filter((x) => x);
      value = uniq(value);
    }

    return !isEmpty(value, { skipBoolean: true }) ? value : null;
  }

  private replaceAll(string: string, search: string, replace: string) {
    return string.split(search).join(replace);
  }

  //#endregion Saif's code

  async getBase64ImageFromUrl(imageUrl: string) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();
    return blob;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // async uploadImagesFounder() {
  //   for (const founder of this.founderImages) {
  //     var imagebase64: Blob = await this.getBase64ImageFromUrl(founder.imageUrl);
  //     var fd = new FormData();
  //     fd.append('files', imagebase64, uuid.v4());
  //     var obj: any = await firstValueFrom(this.http.post(this.url + 'upload', fd));
  //     obj = await firstValueFrom(this.http.put(this.url + 'founders/' + founder.id, { data: { image: obj[0].id } }));
  //     console.log('Images added to #: ' + founder.id);
  //     this.delay(2000);
  //     // console.log(obj);
  //   }
  // }

  // async uploadImagesCompany() {
  //   for (const company of this.companyImages) {
  //     var imagebase64: Blob = await this.getBase64ImageFromUrl(company.imageUrl);
  //     var fd = new FormData();
  //     fd.append('files', imagebase64, uuid.v4());
  //     var obj: any = await firstValueFrom(this.http.post(this.url + 'upload', fd));
  //     obj = await firstValueFrom(this.http.put(this.url + 'companies/' + company.id, { data: { logo: obj[0].id } }));
  //     console.log('Images added to #: ' + company.id);
  //     this.delay(2000);
  //     // console.log(obj);
  //   }
  // }

  async connectFoundersAndCompany() {
    for (let i = 1; i < 4; i++) {
      let obj: any = await firstValueFrom(this.http.get(this.url + 'companies?pagination[page]=' + i + '&pagination[pageSize]=100&fields[0]=cbUrl'));
      console.log(obj);
      for (const company of obj.data) {
        var cbUrl = company['attributes']['cbUrl'];
        let founders: any = await firstValueFrom(this.http.get(this.url + 'founders?pagination[pageSize]=100&fields[0]=id&filters[companyUrl][$eq]=' + cbUrl));
        var founderIds: number[] = [];
        for (const f of founders['data']) {
          founderIds.push(f['id']);
        }
        console.log(founderIds);
        obj = await firstValueFrom(this.http.put(this.url + 'companies/' + company['id'], { data: { founders: founderIds } }));
        // break;
      }
      // break;
    }
  }

  importEvents() {
    this.http.get('assets/csv/events-9-28-2021.csv', { responseType: 'text' }).subscribe((data: any) => {
      let options: ParseConfig = {
        complete: async (results, file) => {
          console.log(results);
          for (const [key, item] of results['data'][0].entries()) {
            this.companyAttributes.push({ checked: false, text: key + ' - ' + item });
          }
          for (let i = 1; i < results['data'].length; i++) {
            var event = {
              name: results['data'][i][0],
              cbUrl: results['data'][i][1],
              startDate: results['data'][i][2],
              endDate: results['data'][i][3],
              city: results['data'][i][4].split(',')[0].trim(),
              state: results['data'][i][4].split(',')[1].trim(),
              country: results['data'][i][4].split(',')[2].trim(),
            };
            var obj = await firstValueFrom(this.http.post(this.url + 'events', { data: event }));
            console.log('event # added: ' + i);
          }
        },
      };
      this.papa.parse(data, options);
    });
  }

  isURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return pattern.test(str);
  }

  importCompanies() {
    this.http.get('assets/csv/moreData/United Arab Emirates/Company.csv', { responseType: 'text' }).subscribe((data: any) => {
      let options: ParseConfig = {
        complete: async (results, file) => {
          for (const [key, item] of results['data'][0].entries()) {
            this.companyAttributes.push({ checked: false, text: key + ' - ' + item });
          }
          for (let i = 4420; i < results['data'].length; i++) {
            let prev: any = await firstValueFrom(this.http.get(this.url + 'companies?fields[0]=id&filters[cbUrl][$eq]=' + results['data'][i][0]));
            if (prev.data.length != 0) {
              continue;
            }

            // console.log(results['data'][i]);
            //Company Type
            var companyTypeId;
            // console.log(results['data'][i][12] == '�')
            // console.log(results['data'][i][12])
            if (results['data'][i][11] && results['data'][i][11] != '�') {
              console.log('Company Type: ' + results['data'][i][11]);
              companyTypeId = await this.createAttribute(results['data'][i][11], 'company-types');
            }
            // Industires
            let industires: number[] = [];
            if (results['data'][i][2] && results['data'][i][2] != '�') {
              let entries = results['data'][i][2].split(',');
              for (const entry of entries) {
                if (entry != '') {
                  console.log('Industry: ' + entry);
                  industires.push(await this.createAttribute(entry.trim(), 'industries'));
                  // console.log(this.new)
                }
              }
            }
            // Industry Groups
            let industryGroups: number[] = [];
            // if (results['data'][i][24] && results['data'][i][24] != '�' && !this.isURL(results['data'][i][24])) {
            //   let entries = results['data'][i][24].split(',');
            //   for (const entry of entries) {
            //     console.log("Industry Group: " + entry.trim());
            //     industryGroups.push(await this.createAttribute(entry.trim(), 'industry-groups'));
            //   }
            // }
            // if (results['data'][i][29] && results['data'][i][29] != '�' && !this.isURL(results['data'][i][29])) {
            //   let entries = results['data'][i][29].split(',');
            //   for (const entry of entries) {
            //     console.log("Industry Group: " + entry.trim());
            //     industryGroups.push(await this.createAttribute(entry.trim(), 'industry-groups'));
            //   }
            // }
            // if (results['data'][i][31] && results['data'][i][31] != '�' && !this.isURL(results['data'][i][31])) {
            //   let entries = results['data'][i][31].split(',');
            //   for (const entry of entries) {
            //     console.log("Industry Group: " + entry.trim());
            //     industryGroups.push(await this.createAttribute(entry.trim(), 'industry-groups'));
            //   }
            // }

            // Investors
            // let investor: number[] = [];
            // if (results['data'][i][53]) {
            //   let entries = results['data'][i][53].split(',');
            //   for (const entry of entries) {
            //     // console.log(entry.trim())
            //     // investor.push(await this.createAttribute(entry.trim(), 'investors'));
            //   }
            // }
            // Investor Types
            let investorTypes: number[] = [];
            if (results['data'][i][19] && results['data'][i][19] != '�') {
              let entries = results['data'][i][19].split(',');
              for (const entry of entries) {
                console.log('Investor Type: ' + entry.trim());
                investorTypes.push(await this.createAttribute(entry.trim(), 'investor-types'));
              }
            }
            // Investor Stages
            let investorStages: number[] = [];
            if (results['data'][i][20] && results['data'][i][20] != '�') {
              let entries = results['data'][i][20].split(',');
              for (const entry of entries) {
                console.log('Investor Stage: ' + entry.trim());
                investorStages.push(await this.createAttribute(entry.trim(), 'investor-stages'));
              }
            }
            //Funding Type
            // var lastFundingTypeId;
            // if (results['data'][i][49]) {
            //   // lastFundingTypeId = await this.createAttribute(results['data'][i][49].trim(), 'funding-types');
            // }
            // //Equity Funding Type
            // var lastEquityFundingTypeId;
            // if (results['data'][i][45]) {
            //   // lastEquityFundingTypeId = await this.createAttribute(results['data'][i][45].trim(), 'funding-types');
            // }

            let foundingDate = null as any;
            if (results['data'][i][8] != '�') {
              foundingDate = new Date(results['data'][i][8]);
            }
            let company = {
              name: results['data'][i][1],
              streetAddress: results['data'][i][3] + ', United Arab Emirates',
              city: results['data'][i][3],
              // state: results['data'][i][4],
              country: 'United Arab Emirates',
              // employees: results['data'][i][14],
              companyType: companyTypeId,
              // totalFunding: results['data'][i][42],
              IPOStatus: 'Public',
              website: results['data'][i][18],
              cbRank: results['data'][i][5],
              // investments: results['data'][i][33],
              // stockSymbol: results['data'][i][67],
              // acquisitions: results['data'][i][56],
              industries: industires,
              foundingDate: foundingDate,
              isOperating: true,
              contactEmail: results['data'][i][14] == '�' ? null : results['data'][i][14],
              about: results['data'][i][4],
              facebook: results['data'][i][16],
              linkedin: results['data'][i][15],
              twitter: results['data'][i][17],
              cbUrl: results['data'][i][0],
              phoneNumber: results['data'][i][13] == '�' ? null : results['data'][i][13],
              fullDescription: results['data'][i][12] == '�' ? null : results['data'][i][12],
              // headquarterRegions: results['data'][i][15],
              // numberOfArticles: results['data'][i][18],
              // hubTags: results['data'][i][19],
              // SEMrushMonthlyVisits: results['data'][i][20],
              // SEMrushGTR: results['data'][i][21],
              industryGroups: industryGroups,
              EstimatedRevenueRange: results['data'][i][6] == '�' ? null : results['data'][i][6],
              // SEMrushMonthlyVisitsGrowth: results['data'][i][24],
              // BuiltWithActiveTechCount: results['data'][i][25],
              // ApptopiaNumberOfApps: results['data'][i][26],
              // numberOfFounders: this.returnNumber(results['data'][i][27]),
              // foundedDatePrecision: results['data'][i][29],
              investorTypes: investorTypes,
              investorStages: investorStages,
            };
            // console.log(company)
            // let oldCompany: any = await firstValueFrom(
            //   this.http.get(this.url + 'companies?fields[0]=id&filters[cbUrl][$eq]=' + company.cbUrl)
            // );
            // if (oldCompany.data.length == 0) {
            console.log(company);
            this.new++;
            var obj: any = await firstValueFrom(this.http.post(this.url + 'companies', { data: company }));
            console.log('company # added: ' + this.new + ', with ID: ' + obj.data.id);
            // break;
            // }
            // console.log(oldCompany.data[0].id);
            // var obj = await firstValueFrom(this.http.put(this.url + 'companies/' + oldCompany.data[0].id, { data: company }));
            // break;
          }
        },
      };
      this.papa.parse(data, options);
    });
  }

  returnNumber(text: string): number {
    // console.log(text);
    let n = parseInt(text);
    // console.log(n);
    if (isNaN(n)) {
      return 0;
    }
    return n;
  }

  async createAttribute(text: string, table: string): Promise<number> {
    let obj: any = await firstValueFrom(this.http.get(this.url + table + '?filters[name][$eq]=' + text));
    if (obj.data.length == 0) {
      console.log('New Created In: ' + table + ' ,Value= ', text);
      obj = await firstValueFrom(this.http.post(this.url + table, { data: { name: text } }));
      return obj.data.id;
    }
    return obj.data[0].id;
  }
}
('p=1&idCountries[]=414&employeesFrom=63&employeesTo=63&itemsPerPage=100&sortMethod=revenueDesc&currency=USD&typePrivate=1&typePublic=1&statusActive=1&statusInactive=1&foundingYearTo=2023&countryCode=PK&revenueTo=1000000000000');
