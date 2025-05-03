import { Injectable, OnInit } from '@angular/core';
import { IDropDown } from '../../../common/IDropDown';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DefIndicatorService implements OnInit {
  readonly APIUrl: string =
    'https://tourismapi.geostat.ge/api/DefaultIndicator';

  readonly SharedUrl: string = 'https://tourismapi.geostat.ge/api/Shared';

  constructor(private http: HttpClient) {
    this.lang = localStorage.getItem('Language');
  }
  ngOnInit(): void {}

  lang: any;

  periods: IDropDown[] = [
    { name: 'წლიური', value: 1, isDisabled: false },
    { name: 'კვარტალური', value: 2, isDisabled: false },
    // { name: 'ყოველთვიური', value: 3, isDisabled: false },
  ];

  periodsEN: IDropDown[] = [
    { name: 'Annual', value: 1, isDisabled: false },
    { name: 'Quarterly', value: 2, isDisabled: false },
    // { name: 'Monthly', value: 3, isDisabled: false },
  ];

  getPeriods() {
    if (this.lang == 'ENG') {
      return this.periodsEN;
    } else {
      return this.periods;
    }
  }

  selPeriod = { name: 'წლიური', value: 1 };

  GetVisitTypes() {
    return this.http.get<any>(
      this.SharedUrl + '/getNamesWithID?entity=TourTypes&lang=' + this.lang
    );
  }

  GetTourismTypes() {
    return this.http.get<any>(
      this.SharedUrl + '/getNamesWithID?entity=TourismTypes&lang=' + this.lang
    );
  }

  GetGenders() {
    return this.http.get<any>(
      this.SharedUrl + '/getNamesWithID?entity=Genders&lang=' + this.lang
    );
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

  GetAges() {
    return this.http.get<any>(
      this.SharedUrl + '/getNamesWithID?entity=AgeGroups&lang=' + this.lang
    );
  }

  selTtype = { name: 'უცხოელი ვიზიტორები', value: 1 };

  indicators: IDropDown[] = [
    { name: 'ყველა', value: 0, isDisabled: false },
    { name: 'ეკონომიკური სტატუსი', value: 1, isDisabled: false },
    { name: 'ასაკი', value: 2, isDisabled: false },
    { name: 'სქესი', value: 3, isDisabled: false },
    { name: 'ვიზიტის მიზანი', value: 4, isDisabled: false },
    { name: 'კმაყოფილების დონე', value: 5, isDisabled: false },
    { name: 'ვიზიტის ტიპი', value: 6, isDisabled: false },
    { name: 'ტრანსპორტი', value: 9, isDisabled: false },
    { name: 'აქტივობა', value: 10, isDisabled: false },
    { name: 'ვიზიტის რიგითობა', value: 11, isDisabled: false },
    { name: 'მონახულებული ქვეყნები', value: 12, isDisabled: true },
  ];

  indicatorsEN: IDropDown[] = [
    { name: 'Total', value: 0, isDisabled: false },
    { name: 'Economic Status', value: 1, isDisabled: false },
    { name: 'Age', value: 2, isDisabled: false },
    { name: 'Gender', value: 3, isDisabled: false },
    { name: 'Purpose Of Visit', value: 4, isDisabled: false },
    { name: 'Satisfaction Level', value: 5, isDisabled: false },
    { name: 'Type of Visit', value: 6, isDisabled: false },
    { name: 'Transport', value: 9, isDisabled: false },
    { name: 'Activity', value: 10, isDisabled: false },
    { name: 'Order Of Visit', value: 11, isDisabled: false },
    { name: 'Visited countries', value: 12, isDisabled: true },
  ];

  getIndicators() {
    if (this.lang == 'ENG') {
      return this.indicatorsEN;
    } else {
      return this.indicators;
    }
  }

  selIndicator = { name: 'ყველა', value: 0 };

  GetActivityNames(tourismType: number, lang: string) {
    var url =
      this.APIUrl +
      '/econStatusies?tourismType=' +
      tourismType +
      '&lang=' +
      lang;

    return this.http.get<any>(url);
  }

  GetAgeNames(flag: number, lang: string) {
    var url = this.APIUrl + '/ages?tourismType=' + flag + '&lang=' + lang;

    return this.http.get<any>(url);
  }

  GetGenderNames(tourismType: number, lang: string) {
    var url =
      this.APIUrl + '/genders?tourismType=' + tourismType + '&lang=' + lang;

    return this.http.get<any>(url);
  }

  GetGoalNames(tourismType: number, lang: string) {
    var url =
      this.APIUrl + '/goals?tourismType=' + tourismType + '&lang=' + lang;

    return this.http.get<any>(url);
  }

  GetRateNames(lang: string) {
    var url = this.APIUrl + '/rates?lang=' + lang;

    return this.http.get<any>(url);
  }

  GetTourNames(lang: string) {
    var url = this.APIUrl + '/tours?lang=' + lang;

    return this.http.get<any>(url);
  }

  GetTransportNames(tourismType: number, lang: string) {
    var url =
      this.APIUrl + '/transports?tourismType=' + tourismType + '&lang=' + lang;

    return this.http.get<any>(url);
  }

  GetVisitNames(tourismType: number, lang: string) {
    var url =
      this.APIUrl + '/visits?tourismType=' + tourismType + '&lang=' + lang;

    return this.http.get<any>(url);
  }

  GetOrderNames(lang: string) {
    var url = this.APIUrl + '/orders?lang=' + lang;

    return this.http.get<any>(url);
  }

  GetSeenCountryesNames(lang: string) {
    var url = this.APIUrl + '/seencountries?lang=' + lang;

    return this.http.get<any>(url);
  }
}
