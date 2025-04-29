import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { SharedService } from 'src/app/shared.service';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import { DefIndicatorService } from '../default-indicator/services/def-indicator.service';
import { IDropDown } from 'src/app/common/IDropDown';
// import { create } from 'lodash';
// import { Month } from 'src/app/common/Month';

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.scss'],
})
export class InteractiveMapComponent implements OnInit, OnDestroy {
  constructor(
    private http: HttpClient,
    private commonService: SharedService,
    private renderer: Renderer2,
    private defService: DefIndicatorService
  ) {
    this.lang = localStorage.getItem('Language');
  }

  lang: any;

  searchText: any;

  readonly APIUrl: string = 'https://tourismapi.geostat.ge/api/visitors';

  unsubscribe$ = new Subject<void>();

  yearSelect: number = 0;
  quarterSelect: number = 0;
  monthSelect: number = 0;
  genderSelect: number = 0;
  ageSelect: number = 0;
  mapchart!: am4maps.MapChart;
  worldSeries!: am4maps.MapPolygonSeries;
  similarDatas: any;
  chartName: string = '';
  countryImg: string = '';
  countriesData: any = [];
  georgiaText: string = '';
  georgiaSelected: boolean = false;
  vTypes: IDropDown[] = [];
  genders: IDropDown[] = [];
  quarters: IDropDown[] = [];
  agesOptions: IDropDown[] = [];
  monthsOptions: IDropDown[] = [];

  sliderLowestVal: number = 0;
  sliderHighestVal: number = 0;
  sliderValue: number = 0;
  countriesForChart: any = [];
  selectedYear: number = 0;
  selectedQuarter: number = 0;
  selectedMonth: number = 0;
  selectedGender: number = 0;
  selectedAge: number = 0;
  tourType: number = 0;
  public amDatas = [];
  selectedCountryDataId: number = -1;
  tempData: any;
  yearsOptions: number[] = [];

  perNights = false;
  notIn = false;

  isShown: boolean = true;

  // VisitTypeOptions etc.

  vTypeSelect = 0;

  selectedVType: number = 0;

  georgiaOrNot(cid: number) {
    if (cid == 1) {
      this.georgiaSelected = true;
    } else {
      this.georgiaSelected = false;
    }
  }

  GetVisitTypes() {
    this.defService
      .GetVisitTypes()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (this.lang == 'GEO') {
          this.vTypes.push({ name: 'ყველა', value: 0, isDisabled: false });
        } else {
          this.vTypes.push({ name: 'All', value: 0, isDisabled: false });
        }

        for (const key of Object.keys(res)) {
          this.vTypes.push({ name: key, value: res[key], isDisabled: false });
        }
      });
  }

  GetAges() {
    this.defService
      .GetAges()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (this.lang == 'GEO') {
          this.agesOptions.push({ name: 'ყველა', value: 0, isDisabled: false });
        } else {
          this.agesOptions.push({ name: 'All', value: 0, isDisabled: false });
        }

        for (const key of Object.keys(res)) {
          this.agesOptions.push({
            name: key,
            value: res[key],
            isDisabled: false,
          });
        }
      });
  }

  GetMonthies() {
    this.defService
      .GetMonthies()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (this.lang == 'GEO') {
          this.monthsOptions.push({
            name: 'ყველა',
            value: 0,
            isDisabled: false,
          });
        } else {
          this.monthsOptions.push({ name: 'All', value: 0, isDisabled: false });
        }

        for (const key of Object.keys(res)) {
          this.monthsOptions.push({
            name: key,
            value: res[key],
            isDisabled: false,
          });
        }
      });
  }

  GetQuarters() {
    this.defService
      .GetQuarters()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (this.lang == 'GEO') {
          this.quarters.push({ name: 'ყველა', value: 0, isDisabled: false });
        } else {
          this.quarters.push({ name: 'All', value: 0, isDisabled: false });
        }

        for (const key of Object.keys(res)) {
          this.quarters.push({ name: key, value: res[key], isDisabled: false });
        }
      });
  }

  selectvTypeChange() {
    this.selectedVType = this.vTypeSelect;

    if (!this.perNights) {
      this.getCountriesList();
    } else {
      this.getCountriesListNights();
    }

    forkJoin({
      countriesList: this.getQueryCountriesList(),
      nights: this.getQueryNights(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ countriesList, nights }) => {
        this.resulti = countriesList.map((obj: any) => ({
          ...obj,
          ...nights.find((o: any) => o.countryId === obj.countryId),
        }));
        return this.resulti;
      });
    this.getDataForTable();
  }

  ngOnInit(): void {
    this.getYears()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((arg) => {
        arg = arg.sort((a: { id: string }, b: { id: string }) =>
          b.id.localeCompare(a.id)
        );

        this.yearSelect = Number(arg[0].id);
        this.selectedYear = Number(arg[0].id);
        this.sliderLowestVal = Number(arg[arg.length - 1].id);
        this.sliderHighestVal = Number(arg[0].id);
        this.sliderValue = Number(arg[0]);
        arg.forEach((el: any) => {
          this.yearsOptions.push(Number(el.id));
        });

        this.SelectCountryData1();
        this.getDataForTable();

        this.GetVisitTypes();
        this.GetGenderOptions();
        this.GetAges();
        this.GetQuarters();
        this.GetMonthies();

        this.mapchart = am4core.create('chartdiv', am4maps.MapChart);
        this.worldSeries = this.mapchart.series.push(
          new am4maps.MapPolygonSeries()
        );

        if (!this.perNights) {
          this.getCountriesList();
        } else {
          this.getCountriesListNights();
        }

        let polygonSeries = this.worldSeries;
        this.mapchart.exporting.menu = new am4core.ExportMenu();
        this.mapchart.exporting.filePrefix =
          this.lang === 'ENG' ? 'Interactive map' : 'ინტერაქტიული რუკა';

        this.mapchart.exporting.menu.items[0].icon =
          '../../../assets/HomePage/download_icon.svg';
        this.mapchart.exporting.menu.align = 'left';
        this.mapchart.exporting.menu.verticalAlign = 'top';
        this.mapchart.exporting.adapter.add('data', function (data) {
          data.data = [];
          for (var i = 0; i < polygonSeries.data.length; i++) {
            var row = polygonSeries.data[i];
            data.data.push({
              qveyana: row.name,
              value: row.value,
            });
          }
          return data;
        });
      });
  }

  checkVisits = false;
  sortDataVisits() {
    this.checkVisits = !this.checkVisits;
    if (this.checkVisits) {
      let newar = this.dataForTable.sort(
        (a: any, b: any) => a.visits - b.visits
      );
      this.result = newar;
    } else {
      let newar = this.dataForTable.sort(
        (a: any, b: any) => b.visits - a.visits
      );
      this.result = newar;
    }
  }

  checkNights = false;
  sortDataNights() {
    this.checkNights = !this.checkNights;
    if (this.checkNights) {
      let newar = this.dataForTable.sort(
        (a: any, b: any) => a.avarNights - b.avarNights
      );
      this.result = newar;
    } else {
      let newar = this.dataForTable.sort(
        (a: any, b: any) => b.avarNights - a.avarNights
      );
      this.result = newar;
    }
  }

  checkCountryes = false;
  sortCountryes() {
    this.checkCountryes = !this.checkCountryes;
    if (this.checkCountryes) {
      let newar = this.dataForTable.sort((a: any, b: any) => {
        return a.countryNameGe.localeCompare(b.countryNameGe);
      });
      this.result = newar;
    } else {
      let newar = this.dataForTable.sort((a: any, b: any) => {
        return b.countryNameGe.localeCompare(a.countryNameGe);
      });
      this.result = newar;
    }
  }

  myarr(myarr: any): any {
    throw new Error('Method not implemented.');
  }

  GetGenderOptions() {
    this.defService
      .GetGenders()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (this.lang == 'GEO') {
          this.genders.push({ name: 'ყველა', value: 0, isDisabled: false });
        } else {
          this.genders.push({ name: 'All', value: 0, isDisabled: false });
        }

        for (const key of Object.keys(res)) {
          this.genders.push({ name: key, value: res[key], isDisabled: false });
        }
      });
  }

  countryDatas: any = [];
  nightDatas: any = [];
  selectedCountryIso!: string;
  result: any = [];
  resulti: any = [];
  re: any = [];

  sh: boolean = false;

  zoomToCountry(cid: string) {
    let country = this.worldSeries.getPolygonById(cid);
    this.mapchart.zoomToMapObject(country);
  }

  show() {
    this.isShown = true;
  }

  noshow() {
    this.isShown = false;
  }

  formatThousands(value: number) {
    return String(value).replace(/(?!^)(?=(?:\d{3})+$)/g, ' ');
  }

  interval(func: any, wait: any, times: any, start: number) {
    var interv = (function (w, t) {
      return function () {
        if (typeof t === 'undefined' || t-- > 0) {
          setTimeout(interv, w);
          try {
            func.call(null);
          } catch (e: any) {
            t = 0;
            throw e.toString();
          }
        }
      };
    })(wait, times);

    setTimeout(interv, start == 0 ? 0 : wait);
    start = 1;
  }

  onPlayClick() {
    let count = this.sliderHighestVal - this.sliderLowestVal + 1;
    let start: number = this.sliderLowestVal;

    this.interval(
      () => {
        this.sliderValue = start;
        this.OnSliderValueChanged(start);
        this.selectedYear = this.sliderValue;
        this.yearSelect = this.sliderValue;
        start++;
      },
      3000,
      count,
      0
    );
  }

  OnSliderValueChanged(val: any) {
    this.selectedYear = val;
    this.yearSelect = val;

    if (!this.perNights) {
      this.getCountriesList();
    } else {
      this.getCountriesListNights();
    }

    forkJoin({
      countriesList: this.getQueryCountriesList(),
      nights: this.getQueryNights(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ countriesList, nights }) => {
        this.resulti = countriesList.map((obj: any) => ({
          ...obj,
          ...nights.find((o: any) => o.countryId === obj.countryId),
        }));
        return this.resulti;
      });
    this.getDataForTable();

    // --------------------------
  }
  selectElement(cid: string, isNew: boolean, oldCid: string) {
    (<HTMLInputElement>document.getElementById(cid + '1')).classList.add(
      'selected'
    );
    (<HTMLInputElement>document.getElementById(cid + '2')).classList.add(
      'selected'
    );
    (<HTMLInputElement>document.getElementById(cid + '3')).classList.add(
      'selected'
    );
    if (!isNew) {
      (<HTMLInputElement>(
        document.getElementById(oldCid + '1')
      )).classList.remove('selected');
      (<HTMLInputElement>(
        document.getElementById(oldCid + '2')
      )).classList.remove('selected');
      (<HTMLInputElement>(
        document.getElementById(oldCid + '3')
      )).classList.remove('selected');
    }
  }
  GetCountryIso(id: number) {
    this.http
      .get(this.APIUrl + '/ISOByNumeric/' + id, { responseType: 'text' })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((arg) => {
        this.zoomToCountry(arg);
      });
  }
  SelectCountryData(cid: number) {
    var temp = this.selectedCountryDataId == -1 ? true : false;
    this.selectElement(
      cid.toString(),
      temp,
      this.selectedCountryDataId.toString()
    );
    this.selectedCountryDataId = cid;
    this.getCountriesForChart(cid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((arg) => {
        if (arg.length == 0) {
          arg.push({
            yearN0: this.yearSelect,
            value: 0,
            tourType: this.tourType,
            monthNo: 0,
            gender: 0,
            countryNameGe: '',
            countryId: cid,
            ageGroup: 0,
          });
          let resWithFlake = this.addFlakeToGeorgia(arg, 'countryNameGe');
          this.renderChartObject(resWithFlake);
        } else {
          let resWithFlake = this.addFlakeToGeorgia(arg, 'countryNameGe');
          this.renderChartObject(resWithFlake);
        }
      });
    this.GetCountryIso(cid);
    this.sh = true;
  }

  SelectCountryData1() {
    this.getCountriesForChart(0)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((arg) => {
        let resWithFlake = this.addFlakeToGeorgia(arg, 'countryNameGe');
        this.renderChartObject(resWithFlake);
      });
  }

  selectTourType(type: number) {
    this.tourType = type;

    if (!this.perNights || this.tourType != 0) {
      this.getCountriesList();
    } else {
      this.getCountriesListNights();
    }

    forkJoin({
      countriesList: this.getQueryCountriesList(),
      nights: this.getQueryNights(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ countriesList, nights }) => {
        this.resulti = countriesList.map((obj: any) => ({
          ...obj,
          ...nights.find((o: any) => o.countryId === obj.countryId),
        }));
        return this.resulti;
      });
    this.getDataForTable();
  }
  selectYearChange() {
    this.selectedYear = this.yearSelect;
    this.sliderValue = this.yearSelect;

    if (!this.perNights) {
      this.getCountriesList();
    } else {
      this.getCountriesListNights();
    }

    forkJoin({
      countriesList: this.getQueryCountriesList(),
      nights: this.getQueryNights(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ countriesList, nights }) => {
        this.resulti = countriesList.map((obj: any) => ({
          ...obj,
          ...nights.find((o: any) => o.countryId === obj.countryId),
        }));
        return this.resulti;
      });
    this.getDataForTable();
  }

  selectMonthChange() {
    this.selectedQuarter = 0;
    this.quarterSelect = 0;

    if (this.monthSelect == 0) {
      this.selectedMonth = 0;
    } else {
      this.selectedMonth = this.monthSelect;
    }

    if (!this.perNights) {
      this.getCountriesList();
    } else {
      this.getCountriesListNights();
    }

    forkJoin({
      countriesList: this.getQueryCountriesList(),
      nights: this.getQueryNights(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ countriesList, nights }) => {
        this.resulti = countriesList.map((obj: any) => ({
          ...obj,
          ...nights.find((o: any) => o.countryId === obj.countryId),
        }));
        return this.resulti;
      });
    this.getDataForTable();
  }

  selectQuarterChange() {
    this.selectedQuarter = this.quarterSelect;
    this.monthSelect = 0;
    this.selectedMonth = 0;

    if (!this.perNights) {
      this.getCountriesList();
    } else {
      this.getCountriesListNights();
    }

    forkJoin({
      countriesList: this.getQueryCountriesList(),
      nights: this.getQueryNights(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ countriesList, nights }) => {
        this.resulti = countriesList.map((obj: any) => ({
          ...obj,
          ...nights.find((o: any) => o.countryId === obj.countryId),
        }));
        return this.resulti;
      });
    this.getDataForTable();
  }

  selectGenderChange() {
    this.selectedGender = this.genderSelect;

    if (!this.perNights) {
      this.getCountriesList();
    } else {
      this.getCountriesListNights();
    }

    forkJoin({
      countriesList: this.getQueryCountriesList(),
      nights: this.getQueryNights(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ countriesList, nights }) => {
        this.resulti = countriesList.map((obj: any) => ({
          ...obj,
          ...nights.find((o: any) => o.countryId === obj.countryId),
        }));
        return this.resulti;
      });
    this.getDataForTable();
  }

  async selectAgeChange() {
    this.selectedAge = this.ageSelect;

    if (!this.perNights) {
      this.getCountriesList();
    } else {
      this.getCountriesListNights();
    }

    forkJoin({
      countriesList: this.getQueryCountriesList(),
      nights: this.getQueryNights(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ countriesList, nights }) => {
        this.resulti = countriesList.map((obj: any) => ({
          ...obj,
          ...nights.find((o: any) => o.countryId === obj.countryId),
        }));
        return this.resulti;
      });
    this.getDataForTable();
  }

  onPerNight() {
    this.perNights = true;
  }

  offPerNight() {
    this.perNights = false;
  }

  onNotIn() {
    this.notIn = true;
  }
  onNot() {
    this.notIn = false;
  }

  //http calls
  getGenders() {
    return this.http.get<any>(this.APIUrl + '/Genders');
  }
  getAgeGroups() {
    return this.http.get<any>(this.APIUrl + '/AgeGroups');
  }
  getMonths() {
    return this.http.get<any>(this.APIUrl + '/months' + '?lang=' + this.lang);
  }
  getYears() {
    return this.http.get<any>(this.APIUrl + '/years');
  }

  // --------new--------
  getCountryCodes() {
    return this.http.get<any>(this.APIUrl + '/CountryCodes');
  }

  addFlakeToGeorgia(res: any, parameter: string) {
    let data = res.map((country: any) => {
      if (
        country[parameter] === 'საქართველო' ||
        country[parameter] === 'Georgia'
      ) {
        return {
          ...country,
          [parameter]: country[parameter] + '*',
        };
      } else {
        return country;
      }
    });
    return data;
  }
  // getCountry(){
  //   return this.http.get<any>(this.APIUrl + "/DefaultDatas");
  // }

  // getNights(){
  //   return this.http.get<any>(this.APIUrl + "/DefaultNights");
  // }

  getCountriesForChart(id: number) {
    return this.http.get<any>(
      this.APIUrl +
        '/visitorsByYearForChart?countryId=' +
        id +
        '&lang=' +
        this.lang
    );
  }

  getCountriesList() {
    this.http
      .get<any>(
        this.APIUrl +
          '/WorldMapData?tourType=' +
          this.selectedVType +
          '&year=' +
          this.selectedYear +
          '&month=' +
          this.selectedMonth +
          '&gender=' +
          this.selectedGender +
          '&age=' +
          this.selectedAge +
          '&quarter=' +
          this.selectedQuarter +
          '&lang=' +
          this.lang
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        let resWithFlake = this.addFlakeToGeorgia(res, 'countryName');
        this.renderMapObject(resWithFlake);
        this.countriesData = resWithFlake;
      });
  }

  getCountriesListNights() {
    this.http
      .get<any>(
        this.APIUrl +
          '/WorldMapDataNightsFiltered?&year=' +
          this.selectedYear +
          '&month=' +
          this.selectedMonth +
          '&gender=' +
          this.selectedGender +
          '&age=' +
          this.selectedAge +
          '&quarter=' +
          this.selectedQuarter +
          '&lang=' +
          this.lang
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        let resWithFlake = this.addFlakeToGeorgia(res, 'countryName');
        this.renderMapObject(resWithFlake);
      });
  }

  getQueryCountriesList() {
    return this.http.get<any>(
      this.APIUrl +
        '/Visitor?tourType=' +
        this.vTypeSelect +
        '&year=' +
        this.selectedYear +
        '&month=' +
        this.selectedMonth +
        '&gender=' +
        this.selectedGender +
        '&age=' +
        this.selectedAge +
        '&quarter=' +
        this.selectedQuarter +
        '&lang=' +
        this.lang
    );
  }

  getQueryNights() {
    return this.http.get<any>(
      this.APIUrl +
        '/Nights?tourType=' +
        this.selectedVType +
        '&year=' +
        this.selectedYear +
        '&month=' +
        this.selectedMonth +
        '&gender=' +
        this.selectedGender +
        '&age=' +
        this.selectedAge +
        '&quarter=' +
        this.selectedQuarter +
        '&lang=' +
        this.lang
    );
  }

  dataForTable: any = [];
  getDataForTable() {
    return this.http
      .get<any>(
        // "https://192.168.0.20:5001/api/visitors"
        this.APIUrl +
          '/AvarageNights?tour=' +
          this.selectedVType +
          '&year=' +
          this.selectedYear +
          // '&month=' +
          // this.selectedMonth +
          '&gender=' +
          this.selectedGender +
          '&age=' +
          this.selectedAge +
          '&quarter=' +
          this.selectedQuarter +
          '&lang=' +
          this.lang
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        let resWithFlake = this.addFlakeToGeorgia(res, 'countryNameGe');
        this.dataForTable = resWithFlake;
      });
  }

  getCodes() {
    return this.http.get<any>(this.APIUrl + '/Codes');
  }

  //amcharts
  renderMapObject(mapData: any[]) {
    this.mapchart.geodata = am4geodata_worldLow;

    this.mapchart.projection = new am4maps.projections.Miller();

    let value: any = mapData.values;
    // let toolltip: any = value == 'undefined' ? "0" : "{countryName} - {value}";

    this.worldSeries.exclude = ['AQ'];
    this.worldSeries.useGeodata = true;

    this.mapchart.colors.step = 3;

    let polygonTemplate = this.worldSeries.mapPolygons.template;
    polygonTemplate.tooltipText =
      '{countryName} - {value.formatNumber("#.0a")}';
    // polygonTemplate.tooltipText = toolltip
    polygonTemplate.fill = this.mapchart.colors.getIndex(0);
    polygonTemplate.nonScalingStroke = true;
    this.worldSeries.data = mapData;

    this.worldSeries.heatRules.push({
      property: 'fill',
      target: this.worldSeries.mapPolygons.template,
      min: am4core.color('#8540ff'),
      max: am4core.color('#2c0d63'),
    });
    let a = this.mapchart;
    a.logo.disabled = true;
    a.language.locale['_thousandSeparator'] = ' ';

    let button = a.chartContainer.createChild(am4core.Button);
    button.padding(5, 5, 5, 5);
    button.align = 'right';
    button.marginRight = 15;

    button.events.on('hit', function () {
      a.goHome();
    });

    button.events.on('hit', () => {
      this.SelectCountryData1();
    });

    button.events.on('hit', () => {
      this.selectedCountryDataId = -1;
    });

    button.icon = new am4core.Sprite();
    button.icon.path =
      'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8';
  }
  getFlag() {
    if (this.chartName) {
      let dataForCountryId = this.countriesData.filter((i: any) => {
        return i.countryName === this.chartName;
      });
      if (this.lang === 'GEO' && this.chartName === 'Total') {
        this.chartName = 'სულ';
      }

      if (dataForCountryId.length) {
        this.countryImg =
          'assets/flags/' + dataForCountryId[0].id.toLowerCase() + '.svg';
      } else {
        this.countryImg = 'assets/header/word.png';
      }
    }
    if (this.chartName === 'საქართველო*' || this.chartName === 'Georgia*') {
      this.georgiaText =
        this.lang === 'ENG'
          ? 'Note: Citizens of Georgia who are residents of other countries'
          : 'შენიშვნა: იგულისხმება საქართველოს მოქალაქეები, რომლებიც სხვა ქვეყნის რეზიდენტები არიან';
    }
  }

  renderChartObject(args: any[]) {
    args.map((item: any) => {
      item.yearNo = item.yearNo.toString();
      return item;
    });
    am4core.useTheme(am4themes_animated);
    // Themes end
    let chart = am4core.create('chartdiv2', am4charts.XYChart);
    // chart.paddingRight = 20;
    // chart.colors.step = 3;

    this.chartName = args[0].countryNameGe;

    this.getFlag();

    chart.data = args;
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.axisFills.template.disabled = true;
    dateAxis.renderer.ticks.template.disabled = true;
    dateAxis.renderer.minGridDistance = 50;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#.0a';
    valueAxis.renderer.grid.template.location = 0;

    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = 'yearNo';
    series.dataFields.valueY = 'value';
    // series.name = args[0].countryNameGe;
    // series.bullets.push(new am4charts.CircleBullet());
    series.strokeWidth = 4;
    series.tensionX = 0.8;

    let bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.radius = 6;
    bullet.circle.fill = am4core.color('#fff');
    bullet.circle.strokeWidth = 3;
    series.fill = am4core.color('#67B7DC');
    series.stroke = am4core.color('#67B7DC');

    if (this.selectedCountryDataId == -1) {
      if (this.lang == 'GEO') {
        series.tooltipText = '{yearNo} წელს, {value}';
      }
      if (this.lang == 'ENG') {
        series.tooltipText = '{yearNo} Year, {value}';
      }
    } else {
      if (this.lang == 'GEO') {
        series.tooltipText = '{yearNo} წელს, {value} ვიზიტი {countryNameGe}დან';
      }
      if (this.lang == 'ENG') {
        series.tooltipText =
          '{yearNo} Year, {value} Visits from {countryNameGe}';
      }
    }

    // set stroke property field
    series.propertyFields.stroke = 'color';

    chart.cursor = new am4charts.XYCursor();

    let scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX = scrollbarX;

    dateAxis.keepSelection = true;

    chart.logo.disabled = true;

    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.filePrefix = this.chartName;

    chart.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    chart.exporting.menu.align = 'right';
    chart.exporting.menu.verticalAlign = 'top';

    chart.legend = new am4charts.Legend();

    chart.legend.position = 'top';
    chart.legend.fontSize = 20;
    chart.legend.fontWeight = 'bold';
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    am4core.disposeAllCharts();
  }
}

// function sampleList(sampleList: any) {
//   throw new Error('Function not implemented.');
// }
