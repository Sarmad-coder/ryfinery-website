import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as qs from 'qs';
// import * as deepMerge from 'deepmerge';
// import deepMerge from '@75lb/deep-merge';

import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, firstValueFrom, map, Observable, ReplaySubject, Subject, take } from 'rxjs';
import { inject } from '@angular/core';
import { cloneDeep } from 'lodash-es';

export interface Paginator<TEntity = any> {
  load: (
    query?: any,
    options?: {
      delay?: boolean;
    }
  ) => Promise<boolean>;
  next: () => void;
  textSearch: (text: string, key?: string) => void;
  changePage: (page: number) => void;
  changePageSize: (pageSize: number) => void;
  resetFilter: () => void;
  destroy: () => void;
  hasData: () => boolean;
  data$: Observable<TEntity[]>;
  meta$: Observable<any>;
  queryChanges$: Observable<any>;
  loading$: Observable<boolean>;
  canLoadMore$: Observable<boolean>;
  query: any;
}

export interface PaginatorOptions {
  mode?: 'infinite' | 'page';
  initialLoading?: boolean; // default true
  pageSize?: number;
}

export interface IResponse<T> {
  data: T;
  meta: any;
  error: {
    status: number;
    name: string;
    message: string;
    details: any;
  };
}

export abstract class BaseDataService {
  readonly url!: string;
  protected http: HttpClient;

  constructor(private collectionName: string, http?: HttpClient) {
    this.url = environment.apiUrl + collectionName;
    this.http = http || inject(HttpClient);
  }

  createPaginator<TEntity = any, TQuery = any>(initQuery?: any, options?: PaginatorOptions): Paginator<TEntity> {
    options = { mode: 'infinite', pageSize: 10, initialLoading: true, ...options }; // default settings

    const loading = new BehaviorSubject<boolean>(options.initialLoading as any);
    const data = new ReplaySubject<{ data: TEntity[]; meta: any }>(1);
    const queryChanges = new ReplaySubject<any>(1);
    const delayFetch = new Subject<TQuery | null>();
    const delayMs = 350;
    let nextPage = 1;
    let hasData = false;
    let queryCache: any = {};
    let dataCache: any;

    delayFetch.pipe(debounceTime(delayMs), distinctUntilChanged()).subscribe((query) => perform(query));

    const perform = (query?: any) => {
      query = query || {};
      loading.next(true);

      const _query = {
        ...initQuery,
        ...queryCache,
        ...query,
      };

      _query.filters = {
        ...(initQuery.filters || {}),
        ...(queryCache.filters || {}),
        ...(query.filters || {}),
      };

      _query.pagination = {
        page: _query.pagination?.page || 1,
        pageSize: _query.pagination?.pageSize || options?.pageSize,
      };

      queryCache = _query;
      queryChanges.next(cloneDeep(_query));

      console.log(this.collectionName, 'QUERY:', qs.parse(this.queryToString(_query)));

      this.getAll(_query).then((response) => {
        const loadMore = options?.mode === 'infinite' && _query.pagination.page !== 1;
        const _data = loadMore ? { data: dataCache.data.concat(response.data), meta: response.meta } : response;

        data.next(_data);
        loading.next(false);
        dataCache = _data;
        hasData = !!response.data.length;

        console.log(this.collectionName, 'RESULT:', response);
      });
    };

    return {
      load: (query?: any, _options?: { delay?: boolean }) => {
        _options?.delay ? delayFetch.next(query) : perform(query);

        return firstValueFrom(
          loading.pipe(
            debounceTime(_options?.delay ? delayMs : 0),
            filter((x) => !x),
            take(1)
          )
        );
      },
      next: () => {
        nextPage++;
        const query: any = { pagination: { page: nextPage } };
        perform(query);
      },
      textSearch: (text: string, key: string = 'name') => {
        const query: any = {
          filters: {
            [key]: { $containsi: text || undefined },
          },
        };

        delayFetch.next(query);
      },
      changePage: (page: number) => {
        const query: any = { pagination: { page } };
        perform(query);
      },
      changePageSize: (pageSize: number) => {
        const query: any = { pagination: { pageSize } };
        perform(query);
      },
      resetFilter: () => {
        queryCache.filters = {};
        perform(initQuery);
      },
      hasData: () => hasData,
      destroy: () => {
        loading?.unsubscribe();
        data?.unsubscribe();
        delayFetch?.unsubscribe();
        queryChanges?.unsubscribe();
      },
      get query() {
        return queryCache;
      },
      data$: data.pipe(map((x) => x.data.map((y: any) => ({ id: y.id, ...y.attributes })))),
      meta$: data.pipe(map((x) => x.meta.pagination)),
      loading$: loading.asObservable(),
      canLoadMore$: data.pipe(map((x) => x.meta.pagination.pageCount > 1)),
      queryChanges$: queryChanges.asObservable(),
    };
  }

  getAll(query?: any) {
    return firstValueFrom(this.http.get<IResponse<any[]>>(`${this.url}?${this.queryToString(query)}`));
  }

  getById(id: any) {
    return firstValueFrom(this.http.get<{ data: any; meta: any }>(`${this.url}/${id}`));
  }

  getOne(query?: any) {
    query = { ...query, pagination: { limit: 1 } };
    return this.getAll(query);
  }

  create(data: any, query?: any) {
    return firstValueFrom(this.http.post<{ data: any; meta: any }>(`${this.url}?${this.queryToString(query)}`, { data }));
  }

  update(id: number, data: any, query?: any) {
    return firstValueFrom(this.http.put<{ data: any; meta: any }>(`${this.url}/${id}?${this.queryToString(query)}`, { data }));
  }

  delete(id: number) {
    return firstValueFrom(this.http.delete<IResponse<any>>(`${this.url}/${id}`));
  }

  protected queryToString(query: any) {
    return qs.stringify(query, { encodeValuesOnly: true });
  }
}
