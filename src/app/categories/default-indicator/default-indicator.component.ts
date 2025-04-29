import { Component, OnDestroy, OnInit } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DefIndicatorService } from './services/def-indicator.service';
import { IDropDown } from '../../common/IDropDown';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-default-indicator',
  templateUrl: './default-indicator.component.html',
  styleUrls: ['./default-indicator.component.scss'],
})
export class DefaultIndicatorComponent implements OnInit, OnDestroy {
  readonly APIUrl: string =
    'https://tourismapi.geostat.ge/api/DefaultIndicator';

  unsubscribe$ = new Subject<void>();

  constructor(private http: HttpClient, private srvc: DefIndicatorService) {
    this.GetVisitTypes();
    this.GetTourismTypes();

    // this.periods = this.srvc.getPeriods();
    this.periods = this.srvc.getPeriods_new();
    this.indicators = this.srvc.getIndicators();
    this.isAvarige = false;
    this.lang = localStorage.getItem('Language');
  }

  isAvarige!: boolean;

  lang: any;

  GetVisitTypes() {
    this.srvc
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

  GetTourismTypes() {
    this.srvc
      .GetTourismTypes()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        for (const key of Object.keys(res)) {
          this.tTypes.push({ name: key, value: res[key], isDisabled: false });
        }
      });
  }

  avarigeOrNot(flag: boolean) {
    this.isAvarige = flag;

    am4core.options.autoDispose = true;

    if (this.isAvarige) {
      if (this.period == 3) {
        this.getAvarigeChart(0, 1, this.numbersForAvarige.visit, true);
      } else {
        this.getAvarigeChart(
          this.numbersForAvarige.indicator,
          this.numbersForAvarige.period,
          this.numbersForAvarige.visit,
          true
        );
      }
    } else {
      if (this.period == 3) {
        this.getCostsOnleyChart(0, 1, this.numbersForAvarige.visit, false);
      } else {
        this.getCostsOnleyChart(
          this.numbersForAvarige.indicator,
          this.numbersForAvarige.period,
          this.numbersForAvarige.visit,
          false
        );
      }
    }
  }

  numbersForAvarige = { indicator: 0, period: 1, visit: 0 };

  // selIndic: IDropDown = { name: 'ყველა', value: 0, isDisabled: false };

  // selVtype: IDropDown =  { name: 'ყველა', value: 0, isDisabled: false };

  // selTtype: IDropDown = { name: 'უცხოელი ვიზიტორები', value: 1, isDisabled: false };

  // selPeriod: IDropDown = { name: 'წლიური', value: 1, isDisabled: false };

  periods!: IDropDown[];
  period: number = 1;

  vTypes: IDropDown[] = [];
  vType: number = 0;

  tTypes: IDropDown[] = [];
  tType: number = 1;

  indicators!: IDropDown[];
  indicator: number = 0;

  ngOnInit(): void {
    this.getCostsChart(this.indicator, this.period, this.vType);

    this.getQuantityChart(this.indicator, this.period, this.vType);
  }

  getDropDownLists() {
    am4core.disposeAllCharts();

    this.isAvarige = false;

    this.tTypes.forEach((mem) => (mem.isDisabled = false));
    this.indicators.forEach((mem) => (mem.isDisabled = false));
    this.vTypes.forEach((mem) => (mem.isDisabled = false));
    this.periods.forEach((mem) => (mem.isDisabled = false));

    if (Number(this.indicator) == 12) {
      this.tTypes[0].isDisabled = true;
      this.tTypes[2].isDisabled = true;
    }

    if ([11, 12].includes(Number(this.indicator))) {
      this.tTypes.filter((x) => x.value == 3)[0].isDisabled = true;
    }

    if ([1, 4, 5, 9, 10, 11, 12].includes(Number(this.indicator))) {
      this.periods.filter((x) => x.value == 3)[0].isDisabled = true;
    }

    if (Number(this.period) == 3) {
      this.tTypes.filter((x) => x.value == 3)[0].isDisabled = true;

      this.indicators.forEach((x) => {
        if ([1, 4, 5, 9, 10, 11, 12].includes(x.value)) {
          x.isDisabled = true;
        }
      });
    }

    if (Number(this.tType) != 2) {
      this.indicators.filter((x) => x.value == 12)[0].isDisabled = true;
    }

    if (Number(this.tType) == 3) {
      this.periods.filter((x) => x.value == 3)[0].isDisabled = true;
      this.indicators.filter((x) => x.value == 11)[0].isDisabled = true;
    }
  }

  titleForCostsChart: string = '';
  titleForPerNightsChart: string = '';
  titleForMainChart: string = '';

  showDataRangePicker: boolean = false;

  ClearFilters() {
    this.period = 1;

    this.vType = 0;

    this.indicator = 0;

    this.tType = 1;

    this.getDropDownLists();

    this.bigChart.dispose();
    this.cstChart.dispose();
    this.nghtChart.dispose();

    this.getCostsChart(0, 1, 0);

    this.getQuantityChart(0, 1, 0);
  }

  selectvTypeChange() {
    this.isAvarige = false;
    (document.getElementById('inlineRadio1') as HTMLInputElement).checked =
      true;

    this.getDropDownLists();

    this.cstChart.dispose();
    this.nghtChart.dispose();

    if (Number(this.period) == 3) {
      this.getCostsChartDef(0, 1, this.vType);
      this.numbersForAvarige.indicator = 0;
      this.numbersForAvarige.period = 1;
      this.numbersForAvarige.visit = this.vType;
    } else if ([0, 1, 2, 3, 4, 5, 6, 11].includes(Number(this.indicator))) {
      this.getCostsChart(this.indicator, this.period, this.vType);
      this.numbersForAvarige.indicator = this.indicator;
      this.numbersForAvarige.period = this.period;
      this.numbersForAvarige.visit = this.vType;
    } else {
      this.getCostsChartDef(0, 1, this.vType);
      this.numbersForAvarige.indicator = 0;
      this.numbersForAvarige.period = 1;
      this.numbersForAvarige.visit = this.vType;
    }

    this.bigChart.dispose();

    this.getQuantityChart(this.indicator, this.period, this.vType);
  }

  selectPeriodChange() {
    this.isAvarige = false;
    (document.getElementById('inlineRadio1') as HTMLInputElement).checked =
      true;

    this.getDropDownLists();

    this.cstChart.dispose();
    this.nghtChart.dispose();

    this.bigChart.dispose();

    if (Number(this.period) == 3) {
      this.getCostsChartDef(0, 1, this.vType);
      this.numbersForAvarige.indicator = 0;
      this.numbersForAvarige.period = 1;
      this.numbersForAvarige.visit = this.vType;
    } else if ([0, 1, 2, 3, 4, 5, 6, 11].includes(Number(this.indicator))) {
      this.getCostsChart(this.indicator, this.period, this.vType);
      this.numbersForAvarige.indicator = this.indicator;
      this.numbersForAvarige.period = this.period;
      this.numbersForAvarige.visit = this.vType;
    } else {
      this.getCostsChartDef(0, 1, this.vType);
      this.numbersForAvarige.indicator = 0;
      this.numbersForAvarige.period = 1;
      this.numbersForAvarige.visit = this.vType;
    }

    this.getQuantityChart(this.indicator, this.period, this.vType);
  }

  selecttTypeChange() {
    this.isAvarige = false;
    (document.getElementById('inlineRadio1') as HTMLInputElement).checked =
      true;

    this.getDropDownLists();

    this.bigChart.dispose();

    this.cstChart.dispose();
    this.nghtChart.dispose();

    if (Number(this.period) == 3) {
      this.getCostsChartDef(0, 1, this.vType);
      this.numbersForAvarige.indicator = 0;
      this.numbersForAvarige.period = 1;
      this.numbersForAvarige.visit = this.vType;
    } else if ([0, 1, 2, 3, 4, 5, 6, 11].includes(Number(this.indicator))) {
      this.getCostsChart(this.indicator, this.period, this.vType);
      this.numbersForAvarige.indicator = this.indicator;
      this.numbersForAvarige.period = this.period;
      this.numbersForAvarige.visit = this.vType;
    } else {
      this.getCostsChartDef(0, 1, this.vType);
      this.numbersForAvarige.indicator = 0;
      this.numbersForAvarige.period = 1;
      this.numbersForAvarige.visit = this.vType;
    }

    this.getQuantityChart(this.indicator, this.period, this.vType);
  }

  selectIndicatorChange() {
    this.isAvarige = false;
    (document.getElementById('inlineRadio1') as HTMLInputElement).checked =
      true;

    this.getDropDownLists();

    //this.period = 1;

    // if ([1, 4, 5, 9, 10, 11].includes(this.indicator)) {
    //   this.periods.filter(x => x.value == 3)[0].isDisabled = true;
    // }
    // if (this.indicator == 11){
    //   this.tTypes.filter(x => x.value == 3)[0].isDisabled = true;
    // }

    this.bigChart.dispose();
    this.cstChart.dispose();

    if (Number(this.period) == 3) {
      this.getCostsChartDef(0, 1, this.vType);
      this.numbersForAvarige.indicator = 0;
      this.numbersForAvarige.period = 1;
      this.numbersForAvarige.visit = this.vType;
    } else if ([0, 1, 2, 3, 4, 5, 6, 11].includes(Number(this.indicator))) {
      this.getCostsChart(this.indicator, this.period, this.vType);
      this.numbersForAvarige.indicator = this.indicator;
      this.numbersForAvarige.period = this.period;
      this.numbersForAvarige.visit = this.vType;
    } else {
      this.getCostsChartDef(0, 1, this.vType);
      this.numbersForAvarige.indicator = 0;
      this.numbersForAvarige.period = 1;
      this.numbersForAvarige.visit = this.vType;
    }

    // if (this.indicator < 8 || this.indicator == 9 || this.indicator == 10 || this.indicator == 11){
    //   this.cstChart.dispose();
    //   this.nghtChart.dispose();

    //   this.getCostsChart(this.indicator, this.period, this.vType);
    // }
    // else{
    //   this.cstChart.dispose();
    //   this.nghtChart.dispose();

    //   this.getCostsChartDef(0, 1, this.vType);
    // }

    this.getQuantityChart(this.indicator, this.period, this.vType);
  }

  // HTTP Calls

  getCostsChart(indic: number, per: number, type: number) {
    var uRl =
      this.APIUrl +
      '/costByForign?prop=' +
      indic +
      '&per=' +
      per +
      '&tourType=' +
      type +
      '&lang=' +
      this.lang;

    if (this.tType == 2) {
      uRl =
        this.APIUrl +
        '/costByExit?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&lang=' +
        this.lang;
    } else if (this.tType == 3) {
      uRl =
        this.APIUrl +
        '/costBy?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&lang=' +
        this.lang;
    }

    if (Number(this.period) == 1) {
      this.http
        .get<any>(uRl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.costsChart(res[0]);
          this.perNightsChart(res[1]);
        });
    } else if (Number(this.period) == 2) {
      this.http
        .get<any>(uRl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: any[]) => {
            element.forEach((element) => {
              let st: string = '';

              st = String(element.year);

              let stY: string = st.slice(0, 4);

              let stQ: string = st.slice(5);

              if (stQ == '1') {
                stQ = 'I კვ. ';
              } else if (stQ == '2') {
                stQ = 'II კვ. ';
              } else if (stQ == '3') {
                stQ = 'III კვ. ';
              } else if (stQ == '4') {
                stQ = 'IV კვ. ';
              }

              let fnSt: string = `${stQ} ${stY}`;

              if (this.lang != 'GEO') {
                fnSt = fnSt.replace(/კვ/g, 'Qrt');
              }

              element.year = fnSt;
            });
          });

          this.costsChart(res[0]);
          this.perNightsChart(res[1]);
        });
    }
  }

  getCostsChartDef(indic: number, per: number, type: number) {
    var uRl =
      this.APIUrl +
      '/costByForign?prop=' +
      indic +
      '&per=' +
      per +
      '&tourType=' +
      type +
      '&lang=' +
      this.lang;

    if (this.tType == 2) {
      uRl =
        this.APIUrl +
        '/costByExit?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&lang=' +
        this.lang;
    } else if (this.tType == 3) {
      uRl =
        this.APIUrl +
        '/costBy?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&lang=' +
        this.lang;
    }

    if (Number(this.period) == 1 || Number(this.period) == 3) {
      this.http
        .get<any>(uRl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.costsChartDef(res[0]);
          this.perNightsChartDef(res[1]);
        });
    } else if (Number(this.period) == 2) {
      this.http
        .get<any>(uRl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: any[]) => {
            element.forEach((element) => {
              let st: string = '';

              st = String(element.year);

              let stY: string = st.slice(0, 4);

              let stQ: string = st.slice(5);

              if (stQ == '1') {
                stQ = 'I კვ. ';
              } else if (stQ == '2') {
                stQ = 'II კვ. ';
              } else if (stQ == '3') {
                stQ = 'III კვ. ';
              } else if (stQ == '4') {
                stQ = 'IV კვ. ';
              }

              let fnSt: string = `${stQ} ${stY}`;

              if (this.lang != 'GEO') {
                fnSt = fnSt.replace(/კვ/g, 'Qrt');
              }

              element.year = fnSt;
            });
          });

          this.costsChartDef(res[0]);
          this.perNightsChartDef(res[1]);
        });
    }
  }

  getQuantityChart(indic: number, per: number, type: number) {
    var uRlForBigChart =
      this.APIUrl +
      '/quantityByForign?prop=' +
      indic +
      '&per=' +
      per +
      '&tourType=' +
      type +
      '&lang=' +
      this.lang;

    if (this.tType == 2) {
      uRlForBigChart =
        this.APIUrl +
        '/quantityByExit?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&lang=' +
        this.lang;
    }
    if (this.tType == 3) {
      uRlForBigChart =
        this.APIUrl +
        '/quantityBy?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&lang=' +
        this.lang;
    }
    this.http
      .get<any>(uRlForBigChart)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.didiChart(res);
      });
  }

  // /HTTP Calls

  bigChart: any;

  didiChart(res: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    this.bigChart = am4core.create('chartdiv', am4charts.XYChart);
    let categoryAxis = this.bigChart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'year';
    categoryAxis.renderer.grid.template.location = 0;

    // this.bigChart.colors.step = 7;
    this.bigChart.colors.list = [
      am4core.color('#2330A4'),
      am4core.color('#FDA241'),
      am4core.color('#FF7EAE'),
      am4core.color('#CBBAED'),
      am4core.color('#F5F3BB'),
      am4core.color('#86BA90'),
    ];

    let valueAxis = this.bigChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#.0a';
    valueAxis.renderer.grid.template.location = 0;

    this.bigChart.scrollbarX = new am4core.Scrollbar();
    if (Number(this.period) == 1) {
      this.bigChart.data = res;
    } else if (Number(this.period) == 2) {
      res.forEach((element: { year: string }) => {
        let st: string = '';

        st = String(element.year);

        let stY: string = st.slice(0, 4);

        let stQ: string = st.slice(5);

        if (stQ == '1') {
          stQ = 'I კვ.';
        } else if (stQ == '2') {
          stQ = 'II კვ.';
        } else if (stQ == '3') {
          stQ = 'III კვ.';
        } else if (stQ == '4') {
          stQ = 'IV კვ.';
        }

        let fnSt: string = `${stQ} ${stY}`;

        if (this.lang != 'GEO') {
          fnSt = fnSt.replace(/კვ/g, 'Qrt');
        }

        element.year = fnSt;
      });

      this.bigChart.data = res;
    } else if (Number(this.period) == 3) {
      res.forEach((element: { year: string }) => {
        let st: string = '';

        st = String(element.year);

        let stY: string = st.slice(0, 4);

        let stQ: string = st.slice(5);

        if (stQ == '1') {
          stQ = 'იან, ';
          if (this.lang != 'GEO') {
            stQ = 'Jan, ';
          }
        } else if (stQ == '2') {
          stQ = 'თებ, ';
          if (this.lang != 'GEO') {
            stQ = 'Fab, ';
          }
        } else if (stQ == '3') {
          stQ = 'მარ, ';
          if (this.lang != 'GEO') {
            stQ = 'Mar, ';
          }
        } else if (stQ == '4') {
          stQ = 'აპრ, ';
          if (this.lang != 'GEO') {
            stQ = 'Apr, ';
          }
        } else if (stQ == '5') {
          stQ = 'მაი, ';
          if (this.lang != 'GEO') {
            stQ = 'May, ';
          }
        } else if (stQ == '6') {
          stQ = 'ივნ, ';
          if (this.lang != 'GEO') {
            stQ = 'Jun, ';
          }
        } else if (stQ == '7') {
          stQ = 'ივლ, ';
          if (this.lang != 'GEO') {
            stQ = 'Jul, ';
          }
        } else if (stQ == '8') {
          stQ = 'აგვ, ';
          if (this.lang != 'GEO') {
            stQ = 'Aug, ';
          }
        } else if (stQ == '9') {
          stQ = 'სექ, ';
          if (this.lang != 'GEO') {
            stQ = 'Sep, ';
          }
        } else if (stQ == '10') {
          stQ = 'ოქტ, ';
          if (this.lang != 'GEO') {
            stQ = 'Oct, ';
          }
        } else if (stQ == '11') {
          stQ = 'ნოე, ';
          if (this.lang != 'GEO') {
            stQ = 'Nov, ';
          }
        } else if (stQ == '12') {
          stQ = 'დეკ, ';
          if (this.lang != 'GEO') {
            stQ = 'Dec, ';
          }
        }

        let fnSt: string = `${stQ} ${stY}`;

        element.year = fnSt;
      });

      this.bigChart.data = res;
    }

    if (this.indicator == 0) {
      if (this.lang == 'GEO') {
        this.titleForMainChart = 'ვიზიტების რაოდენობა, სულ';
        this.createSeries5('Default', 'სულ', this.bigChart);
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Total number of visits';
        this.createSeries5('Default', 'Total', this.bigChart);
      }
    } else if (this.indicator == 1) {
      this.srvc
        .GetActivityNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart =
          'ვიზიტების რაოდენობა ეკონომიკური სტატუსის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by Economic status';
      }
    } else if (this.indicator == 2) {
      if (this.tType != 3) {
        this.srvc
          .GetAgeNames(1, this.lang)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((res) => {
            res.forEach((element: string) => {
              this.createSeries5(element, element, this.bigChart);
            });
          });
      } else {
        this.srvc
          .GetAgeNames(2, this.lang)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((res) => {
            res.forEach((element: string) => {
              this.createSeries5(element, element, this.bigChart);
            });
          });
      }

      if (this.lang == 'GEO') {
        this.titleForMainChart = 'ვიზიტების რაოდენობა ასაკის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by age';
      }
    } else if (this.indicator == 3) {
      this.srvc
        .GetGenderNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart = 'ვიზიტების რაოდენობა სქესის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by gender';
      }
    } else if (this.indicator == 4) {
      this.srvc
        .GetGoalNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart = 'ვიზიტების რაოდენობა მიზნის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by purpose';
      }
    } else if (this.indicator == 5) {
      this.srvc
        .GetRateNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart =
          'ვიზიტების რაოდენობა კმაყოფილების დონის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by satisfaction level';
      }
    } else if (this.indicator == 6) {
      this.srvc
        .GetTourNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart = 'ვიზიტების რაოდენობა ვიზიტის ტიპის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by type of visit';
      }
    } else if (this.indicator == 9) {
      this.srvc
        .GetTransportNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart =
          'ვიზიტების რაოდენობა ტრანსპორტის ტიპის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by type of transport';
      }
    } else if (this.indicator == 10) {
      this.srvc
        .GetVisitNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart = 'ვიზიტების რაოდენობა აქტივობის ტიპის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by activity';
      }
    } else if (this.indicator == 11) {
      this.srvc
        .GetOrderNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart = 'ვიზიტების რაოდენობა რიგითობის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by order';
      }
    } else if (this.indicator == 12) {
      this.srvc
        .GetSeenCountryesNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries5(element, element, this.bigChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForMainChart =
          'ვიზიტების რაოდენობა მონახულებული ქვეყნების მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForMainChart = 'Number of visits by visited countries';
      }
    }

    this.bigChart.legend = new am4charts.Legend();

    this.bigChart.exporting.menu = new am4core.ExportMenu();
    this.bigChart.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    this.bigChart.exporting.menu.align = 'right';
    this.bigChart.exporting.menu.verticalAlign = 'top';
    this.bigChart.exporting.filePrefix = this.titleForMainChart;
  }

  cstChart: any;

  costsChart(res: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    this.cstChart = am4core.create('chartdiv2', am4charts.XYChart);
    let categoryAxis = this.cstChart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'year';
    categoryAxis.renderer.grid.template.location = 0;

    // this.cstChart.colors.step = 3;
    this.cstChart.colors.list = [
      am4core.color('#2330A4'),
      am4core.color('#FDA241'),
      am4core.color('#FF7EAE'),
      am4core.color('#CBBAED'),
      am4core.color('#F5F3BB'),
      am4core.color('#86BA90'),
    ];

    let valueAxis = this.cstChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#.0a';
    valueAxis.renderer.grid.template.location = 0;

    this.cstChart.scrollbarX = new am4core.Scrollbar();

    this.cstChart.data = res;

    if (this.indicator == 0) {
      if (this.lang == 'GEO') {
        this.createSeries2('Default', 'სულ', this.cstChart);
        this.titleForCostsChart = 'ხარჯები, სულ (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.createSeries2('Default', 'All', this.cstChart);
        this.titleForCostsChart = 'Total expenditure (thousand GEL)';
      }
    } else if (this.indicator == 1) {
      this.srvc
        .GetActivityNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.cstChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart =
          'ხარჯები ეკონომიკური სტატუსის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Expenditure by the Economic status (thousand GEL)';
      }
    } else if (this.indicator == 2) {
      this.srvc
        .GetAgeNames(2, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.cstChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები ასაკის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure by age (thousand GEL)';
      }
    } else if (this.indicator == 3) {
      this.srvc
        .GetGenderNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.cstChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები სქესის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure by gender (thousand GEL)';
      }
    } else if (this.indicator == 4) {
      this.srvc
        .GetGoalNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.cstChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები მიზნის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure by purpose (thousand GEL)';
      }
    } else if (this.indicator == 5) {
      this.srvc
        .GetRateNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.cstChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები კმაყოფილების დონის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Expenditure by satisfaction level (thousand GEL)';
      }
    } else if (this.indicator == 6) {
      this.srvc
        .GetTourNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.cstChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები ვიზიტის ტიპის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Expenditure by the type of visit (thousand GEL)';
      }
    } else if (this.indicator == 11) {
      this.srvc
        .GetOrderNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.cstChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები რიგითობის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Expenditure by the order of visit (thousand GEL)';
      }
    }

    this.cstChart.legend = new am4charts.Legend();

    this.cstChart.exporting.menu = new am4core.ExportMenu();

    this.cstChart.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    this.cstChart.exporting.menu.align = 'right';
    this.cstChart.exporting.menu.verticalAlign = 'top';
    this.cstChart.exporting.filePrefix = this.titleForCostsChart;
  }

  costsChartDef(res: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    this.cstChart = am4core.create('chartdiv2', am4charts.XYChart);
    let categoryAxis = this.cstChart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'year';
    categoryAxis.renderer.grid.template.location = 0;

    // this.cstChart.colors.step = 3;
    this.cstChart.colors.list = [
      am4core.color('#2330A4'),
      am4core.color('#FDA241'),
      am4core.color('#FF7EAE'),
      am4core.color('#CBBAED'),
      am4core.color('#F5F3BB'),
      am4core.color('#86BA90'),
    ];

    let valueAxis = this.cstChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#.0a';
    valueAxis.renderer.grid.template.location = 0;

    this.cstChart.data = res;

    this.cstChart.scrollbarX = new am4core.Scrollbar();

    if (this.lang == 'GEO') {
      this.createSeries2('Default', 'სულ', this.cstChart);
      this.titleForCostsChart = 'ხარჯები სულ (ათასი ლარი)';
    }
    if (this.lang == 'ENG') {
      this.createSeries2('Default', 'Total', this.cstChart);
      this.titleForCostsChart = 'Total expenditure (Thousand GEL)';
    }

    this.cstChart.legend = new am4charts.Legend();

    this.cstChart.exporting.menu = new am4core.ExportMenu();
    this.cstChart.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    this.cstChart.exporting.menu.align = 'right';
    this.cstChart.exporting.menu.verticalAlign = 'top';
    this.cstChart.exporting.filePrefix = this.titleForCostsChart;
  }

  nghtChart: any;

  perNightsChart(res: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    this.nghtChart = am4core.create('chartdiv3', am4charts.XYChart);
    let categoryAxis = this.nghtChart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'year';
    categoryAxis.renderer.grid.template.location = 0;

    // this.nghtChart.colors.step = 3;
    this.nghtChart.colors.list = [
      am4core.color('#2330A4'),
      am4core.color('#FDA241'),
      am4core.color('#FF7EAE'),
      am4core.color('#CBBAED'),
      am4core.color('#F5F3BB'),
      am4core.color('#86BA90'),
    ];

    let valueAxis = this.nghtChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#';
    valueAxis.renderer.grid.template.location = 0;

    valueAxis.min = 0;
    // valueAxis.max = 1500;

    this.nghtChart.scrollbarX = new am4core.Scrollbar();

    this.nghtChart.data = res;

    if (this.indicator == 0) {
      if (this.lang == 'GEO') {
        this.createSeries3('Default', 'სულ', this.nghtChart);
        this.titleForPerNightsChart = 'ღამეების საშუალო რაოდენობა';
      }
      if (this.lang == 'ENG') {
        this.createSeries3('Default', 'All', this.nghtChart);
        this.titleForPerNightsChart = 'Average Number Of Nights';
      }
    } else if (this.indicator == 1) {
      this.srvc
        .GetActivityNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries3(element, element, this.nghtChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForPerNightsChart =
          'ღამეების საშუალო რაოდენობა ეკონომიკური სტატუსის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForPerNightsChart =
          'Average Number Of Nights By Economic Status';
      }
    } else if (this.indicator == 2) {
      this.srvc
        .GetAgeNames(2, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries3(element, element, this.nghtChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForPerNightsChart =
          'ღამეების საშუალო რაოდენობა ასაკის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForPerNightsChart = 'Average Number Of Nights By Age';
      }
    } else if (this.indicator == 3) {
      this.srvc
        .GetGenderNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries3(element, element, this.nghtChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForPerNightsChart =
          'ღამეების საშუალო რაოდენობა სქესის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForPerNightsChart = 'Average Number Of Nights By Gender';
      }
    } else if (this.indicator == 4) {
      this.srvc
        .GetGoalNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries3(element, element, this.nghtChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForPerNightsChart =
          'ღამეების საშუალო რაოდენობა მიზნის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForPerNightsChart = 'Average Number Of Nights By Purpose';
      }
    } else if (this.indicator == 5) {
      this.srvc
        .GetRateNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries3(element, element, this.nghtChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForPerNightsChart =
          'ღამეების საშუალო რაოდენობა კმაყოფილების დონის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForPerNightsChart =
          'Average Number Of Nights By Satisfaction Level';
      }
    } else if (this.indicator == 6) {
      this.srvc
        .GetTourNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries3(element, element, this.nghtChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForPerNightsChart =
          'ღამეების საშუალო რაოდენობა ვიზიტის ტიპის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForPerNightsChart =
          'Average Number Of Nights By Type Of Visit';
      }
    } else if (this.indicator == 11) {
      this.srvc
        .GetOrderNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries3(element, element, this.nghtChart);
          });
        });
      if (this.lang == 'GEO') {
        this.titleForPerNightsChart =
          'ღამეების საშუალო რაოდენობა რიგითობის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForPerNightsChart =
          'Average Number Of Nights By Order Of Visits';
      }
    }

    this.nghtChart.legend = new am4charts.Legend();

    this.nghtChart.exporting.menu = new am4core.ExportMenu();
    this.nghtChart.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    this.nghtChart.exporting.menu.align = 'right';
    this.nghtChart.exporting.menu.verticalAlign = 'top';
    this.nghtChart.exporting.filePrefix = this.titleForPerNightsChart;
  }

  perNightsChartDef(res: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    this.nghtChart = am4core.create('chartdiv3', am4charts.XYChart);
    let categoryAxis = this.nghtChart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'year';
    categoryAxis.renderer.grid.template.location = 0;

    // this.nghtChart.colors.step = 3;
    this.nghtChart.colors.list = [
      am4core.color('#2330A4'),
      am4core.color('#FDA241'),
      am4core.color('#FF7EAE'),
      am4core.color('#CBBAED'),
      am4core.color('#F5F3BB'),
      am4core.color('#86BA90'),
    ];

    let valueAxis = this.nghtChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#';
    valueAxis.renderer.grid.template.location = 0;

    valueAxis.min = 0;

    this.nghtChart.data = res;

    this.nghtChart.scrollbarX = new am4core.Scrollbar();

    if (this.lang == 'GEO') {
      this.createSeries3('Default', 'სულ', this.nghtChart);
      this.titleForPerNightsChart = 'ღამეების საშუალო რაოდენობა';
    }
    if (this.lang == 'ENG') {
      this.createSeries3('Default', 'All', this.nghtChart);
      this.titleForPerNightsChart = 'Average Number Of Nights';
    }

    this.nghtChart.legend = new am4charts.Legend();

    this.nghtChart.exporting.menu = new am4core.ExportMenu();
    this.nghtChart.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    this.nghtChart.exporting.menu.align = 'right';
    this.nghtChart.exporting.menu.verticalAlign = 'top';
  }

  createSeries2(field: string, name: string, chart: any) {
    // Set up series
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.categoryX = 'year';
    // series.sequencedInterpolation = true;
    // series.dataFields.categoryX.width = 0.1;
    // series.dataFields.categoryX.endLocation = 0.4;
    chart.language.locale['_thousandSeparator'] = ' ';
    chart.numberFormatter.numberFormat = '#.';

    chart.logo.disabled = true;

    // Make it stacked
    series.stacked = true;

    // Configure columns
    series.columns.template.width = am4core.percent(60);

    if (Number(this.period) == 1 || Number(this.period) == 3) {
      if (this.lang == 'GEO') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX} წელს: [bold]{valueY.formatNumber("#.0a")} ₾';
      }
      if (this.lang == 'ENG') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX} Year: [bold]{valueY.formatNumber("#.0a")} ₾';
      }
    } else if (Number(this.period) == 2) {
      series.columns.template.tooltipText =
        '[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.formatNumber("#.0a")} ₾';
    }

    return series;
  }

  createSeries3(field: string, name: string, chart: any) {
    // Set up series
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.categoryX = 'year';
    series.sequencedInterpolation = true;

    chart.language.locale['_thousandSeparator'] = ' ';
    chart.numberFormatter.numberFormat = '#';

    chart.logo.disabled = true;

    // Make it stacked
    series.stacked = true;

    // Configure columns
    series.columns.template.width = am4core.percent(60);
    if (Number(this.period == 1) || Number(this.period == 3)) {
      if (this.lang == 'GEO') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX} წელს: [bold]{valueY.formatNumber("#.0a")} ღამე';
      }
      if (this.lang == 'ENG') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX} Year: [bold]{valueY.formatNumber("#.0a")} Night';
      }
    } else if (Number(this.period) == 2) {
      if (this.lang == 'GEO') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.formatNumber("#.0a")} ღამე';
      }
      if (this.lang == 'ENG') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.formatNumber("#.0a")} Night';
      }
    }

    // Add label
    // let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    // labelBullet.label.text = '{valueY.formatNumber("#")}';
    // labelBullet.locationY = 0.5;
    // labelBullet.label.hideOversized = true;

    return series;
  }

  createSeries5(field: string, name: string, chart: any) {
    // Set up series
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueY = field;
    series.dataFields.categoryX = 'year';
    series.sequencedInterpolation = true;

    // chart.language.locale["_thousandSeparator"] = " ";
    chart.numberFormatter.numberFormat = '#';

    chart.logo.disabled = true;

    // Make it stacked
    series.stacked = true;

    // Configure columns
    series.columns.template.width = am4core.percent(60);
    if (Number(this.period) == 1) {
      if (this.lang == 'GEO') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX} წელს: [bold]{valueY.formatNumber("#.0a")} ვიზიტი';
      }
      if (this.lang == 'ENG') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX} Year: [bold]{valueY.formatNumber("#.0a")} Visits';
      }
    } else if (Number(this.period) == 2) {
      if (this.lang == 'GEO') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.formatNumber("#.0a")} ვიზიტი';
      }
      if (this.lang == 'ENG') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.formatNumber("#.0a")} Visits';
      }
    } else if (Number(this.period) == 3) {
      if (this.lang == 'GEO') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.formatNumber("#.0a")} ვიზიტი';
      }
      if (this.lang == 'ENG') {
        series.columns.template.tooltipText =
          '[bold]{name}[/]\n[font-size:14px]{categoryX}: [bold]{valueY.formatNumber("#.0a")} Visits';
      }
    }
    return series;
  }

  avarigeChart: any;

  avarigeCostsChart(res: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    this.avarigeChart = am4core.create('chartdiv2', am4charts.XYChart);

    var dateAxis = this.avarigeChart.xAxes.push(new am4charts.CategoryAxis());
    dateAxis.dataFields.category = 'year';
    dateAxis.numberFormatter.numberFormat = '#';
    dateAxis.renderer.grid.template.location = 0;

    var valueAxis = this.avarigeChart.yAxes.push(new am4charts.ValueAxis());

    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#';
    valueAxis.renderer.grid.template.location = 0;

    // let categoryAxis = this.nghtChart.xAxes.push(new am4charts.CategoryAxis());
    // categoryAxis.dataFields.category = 'year';
    // categoryAxis.renderer.grid.template.location = 0;

    // this.avarigeChart.colors.step = 3;
    this.avarigeChart.colors.list = [
      am4core.color('#2330A4'),
      am4core.color('#FDA241'),
      am4core.color('#FF7EAE'),
      am4core.color('#CBBAED'),
      am4core.color('#F5F3BB'),
      am4core.color('#86BA90'),
    ];

    // let valueAxis = this.nghtChart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.numberFormatter = new am4core.NumberFormatter();
    // valueAxis.numberFormatter.numberFormat = "#.0a";
    // valueAxis.renderer.grid.template.location = 0;

    this.avarigeChart.scrollbarX = new am4core.Scrollbar();

    this.avarigeChart.data = res;

    this.avarigeChart.legend = new am4charts.Legend();

    this.avarigeChart.logo.disabled = true;

    if (this.numbersForAvarige.indicator == 0) {
      if (this.lang == 'GEO') {
        this.createSeries('Default', 'სულ', this.avarigeChart);
        this.titleForCostsChart = 'საშუალო ხარჯები (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.createSeries('Default', 'Total', this.avarigeChart);
        this.titleForCostsChart = 'Average expenditure (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 1) {
      this.srvc
        .GetActivityNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries(element, element, this.avarigeChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart =
          'საშუალო ხარჯები ეკონომიკური სტატუსის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Average Expenditure By Economic Status (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 2) {
      this.srvc
        .GetAgeNames(2, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries(element, element, this.avarigeChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart =
          'საშუალო ხარჯები ასაკის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Average Expenditure By Age (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 3) {
      this.srvc
        .GetGenderNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries(element, element, this.avarigeChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart =
          'საშუალო ხარჯები სქესის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Average Expenditure By Gender (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 4) {
      this.srvc
        .GetGoalNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries(element, element, this.avarigeChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart =
          'საშუალო ხარჯები მიზნის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Average Expenditure By Purpose (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 5) {
      this.srvc
        .GetRateNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries(element, element, this.avarigeChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'საშუალო ხარჯები კმაყოფილების დონის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Average Expenditure By Level Of Satisfaction';
      }
    } else if (this.numbersForAvarige.indicator == 6) {
      this.srvc
        .GetTourNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries(element, element, this.avarigeChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart =
          'საშუალო ხარჯები ვიზიტის ტიპის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Average Expenditure By Type Of Visit (thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 11) {
      this.srvc
        .GetOrderNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries(element, element, this.avarigeChart);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart =
          'საშუალო ხარჯები რიგითობის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Average Expenditure By Order (Thousand GEL)';
      }
    } else {
      if (this.lang == 'GEO') {
        this.createSeries('Default', 'სულ', this.avarigeChart);
        this.titleForCostsChart = 'საშუალო ხარჯები (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.createSeries('Default', 'Total', this.avarigeChart);
        this.titleForCostsChart = 'Average Expenditure (Thousand GEL)';
      }
    }

    this.avarigeChart.exporting.menu = new am4core.ExportMenu();
    this.avarigeChart.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    this.avarigeChart.exporting.menu.align = 'right';
    this.avarigeChart.exporting.menu.verticalAlign = 'top';
    this.avarigeChart.exporting.filePrefix = this.titleForCostsChart;
  }

  createSeries(field: string, name: string, chart: any) {
    var series = chart.series.push(new am4charts.LineSeries());
    // series.name = name;
    // series.dataFields.valueY = field;
    // series.dataFields.categoryX = 'year';

    series.dataFields.valueY = field;
    series.dataFields.categoryX = 'year';
    series.name = name;
    series.strokeWidth = 3;

    //series.tooltipText = '[bold]{name}[/]\n[font-size:14px]{categoryX} წელს: [bold]{valueY.formatNumber("#")} ათასი ₾';

    series.sequencedInterpolation = true;

    var bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.stroke = am4core.color('#fff');
    bullet.circle.strokeWidth = 2;

    if (this.lang == 'GEO') {
      bullet.tooltipText =
        '[bold]{name}[/]\n[font-size:14px]{categoryX} წელს: [bold]{valueY.formatNumber("#")} ათასი ₾';
    }
    if (this.lang == 'ENG') {
      bullet.tooltipText =
        '[bold]{name}[/]\n[font-size:14px]{categoryX} Year: [bold]{valueY.formatNumber("#")} Thousand ₾';
    }

    let shadow = new am4core.DropShadowFilter();
    shadow.dx = 1;
    shadow.dy = 1;
    bullet.filters.push(shadow);

    chart.logo.disabled = true;

    return series;
  }

  getAvarigeChart(
    indic: number,
    per: number,
    type: number,
    isAvarige: boolean
  ) {
    var uRl =
      this.APIUrl +
      '/avarageForign?prop=' +
      indic +
      '&per=' +
      per +
      '&tourType=' +
      type +
      '&isAvarige=' +
      isAvarige +
      '&lang=' +
      this.lang;

    if (this.tType == 2) {
      uRl =
        this.APIUrl +
        '/avarigeExit?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&isAvarige=' +
        isAvarige +
        '&lang=' +
        this.lang;
    } else if (this.tType == 3) {
      uRl =
        this.APIUrl +
        '/avarige?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&isAvarige=' +
        isAvarige +
        '&lang=' +
        this.lang;
    }

    if (Number(this.period) == 1 || Number(this.period) == 3) {
      this.http
        .get<any>(uRl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.avarigeCostsChart(res);
        });
    } else {
      this.http
        .get<any>(uRl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: { year: string }) => {
            let st: string = '';

            st = String(element.year);

            let stY: string = st.slice(0, 4);

            let stQ: string = st.slice(5);

            if (stQ == '1') {
              stQ = 'I კვ.';
            } else if (stQ == '2') {
              stQ = 'II კვ.';
            } else if (stQ == '3') {
              stQ = 'III კვ.';
            } else if (stQ == '4') {
              stQ = 'IV კვ.';
            }

            let fnSt: string = `${stQ} ${stY}`;

            if (this.lang != 'GEO') {
              fnSt = fnSt.replace(/კვ/g, 'Qrt');
            }

            element.year = fnSt;
          });

          this.avarigeCostsChart(res);
        });
    }
  }

  costsOnley: any;

  costsOnleyChart(res: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    this.costsOnley = am4core.create('chartdiv2', am4charts.XYChart);
    let categoryAxis = this.costsOnley.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'year';
    categoryAxis.renderer.grid.template.location = 0;

    // this.costsOnley.colors.step = 3;
    this.costsOnley.colors.list = [
      am4core.color('#2330A4'),
      am4core.color('#FDA241'),
      am4core.color('#FF7EAE'),
      am4core.color('#CBBAED'),
      am4core.color('#F5F3BB'),
      am4core.color('#86BA90'),
    ];

    let valueAxis = this.costsOnley.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = '#.0a';
    valueAxis.renderer.grid.template.location = 0;

    this.costsOnley.scrollbarX = new am4core.Scrollbar();

    this.costsOnley.data = res;

    this.costsOnley.exporting.menu = new am4core.ExportMenu();
    this.costsOnley.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    this.costsOnley.exporting.menu.align = 'right';
    this.costsOnley.exporting.menu.verticalAlign = 'top';

    if (this.numbersForAvarige.indicator == 0) {
      if (this.lang == 'GEO') {
        this.createSeries2('Default', 'სულ', this.costsOnley);
        this.titleForCostsChart = 'ხარჯები, სულ (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.createSeries2('Default', 'Total', this.costsOnley);
        this.titleForCostsChart = 'Total Expenditure (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 1) {
      this.srvc
        .GetActivityNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.costsOnley);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart =
          'ხარჯები ეკონომიკური სტატუსის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart =
          'Expenditure By Economic Status (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 2) {
      this.srvc
        .GetAgeNames(2, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.costsOnley);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები ასაკის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure By Age (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 3) {
      this.srvc
        .GetGenderNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.costsOnley);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები სქესის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure By Gender (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 4) {
      this.srvc
        .GetGoalNames(this.tType, this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.costsOnley);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები მიზნის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure By Purpose (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 5) {
      this.srvc
        .GetRateNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.costsOnley);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები კმაყოფილების დონის მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure By Satisfaction Level';
      }
    } else if (this.numbersForAvarige.indicator == 6) {
      this.srvc
        .GetTourNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.costsOnley);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები ვიზიტის ტიპის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure By Type Of Visit (Thousand GEL)';
      }
    } else if (this.numbersForAvarige.indicator == 11) {
      this.srvc
        .GetOrderNames(this.lang)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res.forEach((element: string) => {
            this.createSeries2(element, element, this.costsOnley);
          });
        });

      if (this.lang == 'GEO') {
        this.titleForCostsChart = 'ხარჯები რიგითობის მიხედვით (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.titleForCostsChart = 'Expenditure By Order (Thousand GEL)';
      }
    } else {
      if (this.lang == 'GEO') {
        this.createSeries2('Default', 'სულ', this.costsOnley);
        this.titleForCostsChart = 'ხარჯები, სულ (ათასი ლარი)';
      }
      if (this.lang == 'ENG') {
        this.createSeries2('Default', 'Total', this.costsOnley);
        this.titleForCostsChart = 'Total Expenditure (Thousand GEL)';
      }
    }

    this.costsOnley.legend = new am4charts.Legend();
  }

  getCostsOnleyChart(
    indic: number,
    per: number,
    type: number,
    isAvarige: boolean
  ) {
    var uRl =
      this.APIUrl +
      '/costByForign?prop=' +
      indic +
      '&per=' +
      per +
      '&tourType=' +
      type +
      '&isAvarige=' +
      isAvarige +
      '&lang=' +
      this.lang;

    if (this.tType == 2) {
      uRl =
        this.APIUrl +
        '/costByExit?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&isAvarige=' +
        isAvarige +
        '&lang=' +
        this.lang;
    } else if (this.tType == 3) {
      uRl =
        this.APIUrl +
        '/costBy?prop=' +
        indic +
        '&per=' +
        per +
        '&tourType=' +
        type +
        '&isAvarige=' +
        isAvarige +
        '&lang=' +
        this.lang;
    }

    if (Number(this.period) == 1 || Number(this.period) == 3) {
      this.http
        .get<any>(uRl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.costsOnleyChart(res[0]);
        });
    } else if (Number(this.period) == 2) {
      this.http
        .get<any>(uRl)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          res[0].forEach((element: { year: string }) => {
            let st: string = '';

            st = String(element.year);

            let stY: string = st.slice(0, 4);

            let stQ: string = st.slice(5);

            if (stQ == '1') {
              stQ = 'I კვ.';
            } else if (stQ == '2') {
              stQ = 'II კვ.';
            } else if (stQ == '3') {
              stQ = 'III კვ.';
            } else if (stQ == '4') {
              stQ = 'IV კვ.';
            }

            let fnSt: string = `${stQ} ${stY}`;

            if (this.lang != 'GEO') {
              fnSt = fnSt.replace(/კვ/g, 'Qrt');
            }

            element.year = fnSt;
          });

          this.costsOnleyChart(res[0]);
        });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    am4core.disposeAllCharts();
  }
}

export class AppComponent {
  constructor(private location: Location) {}

  goBack() {
    am4core.disposeAllCharts();

    this.location.back();
  }
}
