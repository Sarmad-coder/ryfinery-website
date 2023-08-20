import { Component, OnDestroy, OnInit } from '@angular/core';
import { CountryService } from '@services/data/country.service';
import { EventService } from '@services/data/event.service';
import { SpaceTypeService } from '@services/data/space-type.service';
import { FilterItem } from '@v1/components/filter/filter.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit, OnDestroy {
  showMobileFilter = false;
  defaultSortIndex = 0; // by setting default sort, sort function will be called at start
  SortOrderKey = 'createdAt';
  data: any[] = [];
  page: any = {};
  countries!: FilterItem[];
  spaceTypes!: FilterItem[];
  hasFilters!: FilterItem[];

  eventPaginator = this.eventService.createPaginator({
    populate: {
      image: {
        fields: ['url'],
      },
    },
  });

  countryPaginator = this.countryService.createPaginator(
    {
      fields: ['name'],
      sort: ['name:asc'],
    },
    { pageSize: 5 }
  );

  spaceTypePaginator = this.spaceTypeService.createPaginator(
    {
      fields: ['name'],
      sort: ['name:asc'],
    },
    { pageSize: 5 }
  );

  constructor(private eventService: EventService, private countryService: CountryService, private spaceTypeService: SpaceTypeService) {}

  ngOnInit() {
    this.eventPaginator.data$.subscribe((x) => {
      this.data = x;
    });

    this.eventPaginator.meta$.subscribe((x) => {
      this.page = x.pagination;
    });

    this.countryPaginator.load();
    this.countryPaginator.data$.subscribe((res) => {
      this.countries = res.map((x: any) => ({ id: x.id, name: x.attributes.name, total: 0 }));
    });

    this.spaceTypePaginator.load();
    this.spaceTypePaginator.data$.subscribe((res) => {
      this.spaceTypes = res.map((x: any) => ({ id: x.id, name: x.attributes.name, total: 0 }));
    });

    this.hasFilters = [
      { id: 'hasWifi', name: 'Has Wifi', total: 0 },
      { id: 'hasParking', name: 'Has Parking', total: 0 },
      { id: 'HasPrinter', name: 'Has Printer', total: 0 },
      { id: 'HasMeetingRoom', name: 'Has Meeting Room', total: 0 },
      { id: 'hasHotDrink', name: 'Has Hot Drink', total: 0 },
      { id: 'HasSoftDrink', name: 'Has Soft Drink', total: 0 },
    ];
  }

  ngOnDestroy(): void {
    this.eventPaginator.destroy();
    this.countryPaginator.destroy();
    this.spaceTypePaginator.destroy();
  }

  sort(sort: string) {
    this.eventPaginator.load({ sort: [sort] });
  }

  countryFilter(items: FilterItem[]) {
    const countries = items.filter((x) => x.checked).map((x) => x.name);

    this.eventPaginator.load({
      filters: {
        country: { $in: countries.length ? countries : undefined },
      },
    });
  }

  spaceTypeFilter(item: FilterItem) {
    this.eventPaginator.load({
      filters: {
        space_type: {
          id: { $eq: item.id },
        },
      },
    });
  }

  hasFilter(items: FilterItem[]) {
    const filters = {};

    for (const item of items) {
      filters[item.id] = item.checked ? { $eq: true } : undefined;
    }

    this.eventPaginator.load({ filters });
  }
}
