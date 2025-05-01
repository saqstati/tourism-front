import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BorderService {
  readonly APIUrl: string = 'https://tourismapi.geostat.ge/api/International';

  readonly SharedUrl: string = 'https://tourismapi.geostat.ge/api/Shared';

  constructor(private http: HttpClient) {
    this.lang = localStorage.getItem('Language');
  }

  lang: any;

  GetYears(tType: number) {
    return this.http.get<any>(this.APIUrl + '/borderYears?tType=' + tType);
  }

  GetMonthies() {
    return this.http.get<any>(
      this.SharedUrl + '/getNamesWithID?entity=Monthies&lang=' + this.lang
    );
  }

  GetQuarters() {
    return this.http.get<any>(
      this.SharedUrl + '/getNamesWithID?entity=Quarters&lang=' + this.lang
    );
  }

  GetYearsAll() {
    return this.http.get<any>(this.APIUrl + '/years');
  }

  GetBorderTypes() {
    return this.http.get<any>(
      this.SharedUrl + '/borderTypes?lang=' + this.lang
    );
  }
}
