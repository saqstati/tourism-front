import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { IDropDown } from 'src/app/common/IDropDown';
import { Subject, takeUntil } from 'rxjs';
import { DefIndicatorService } from '../default-indicator/services/def-indicator.service';

@Component({
  selector: 'app-seasonal',
  templateUrl: './seasonal.component.html',
  styleUrls: ['./seasonal.component.scss'],
})
export class SeasonalComponent implements OnInit, OnDestroy {
  readonly APIUrl: string = 'https://tourismapi.geostat.ge/api/Visitors';

  unsubscribe$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private defServise: DefIndicatorService
  ) {
    this.GetTourismTypes();
    this.tType = 2;

    this.GetVisitTypes();
    this.vType = 0;

    this.GetGenders();
    this.gender = 0;

    this.GetAges();
    this.age = 0;

    this.country = '';

    this.lang = localStorage.getItem('Language');
  }

  lang: any;

  ngOnInit(): void {
    //this.getCountries();
    // this.getSeasonal();
    this.getSeasonalPerc();
    this.getCountryes();
  }

  // ----------------------------------------------SELECTS-------------------------------------------------------------

  // TourismTypeOptions etc.

  selectedTType: number = 1;

  tType!: number;
  tTypes: IDropDown[] = [];

  GetTourismTypes() {
    this.defServise
      .GetTourismTypes()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        for (const key of Object.keys(res)) {
          this.tTypes.push({ name: key, value: res[key], isDisabled: false });
        }
      });
  }

  selectedVType: number = 0;

  vType!: number;
  vTypes: IDropDown[] = [];

  GetVisitTypes() {
    this.defServise
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

  selectedGender: number = 0;

  gender!: number;
  genders: IDropDown[] = [];

  GetGenders() {
    this.defServise
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

  selectedAge: number = 0;

  age!: number;
  ages: IDropDown[] = [];

  GetAges() {
    this.defServise
      .GetAges()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (this.lang == 'GEO') {
          this.ages.push({ name: 'ყველა', value: 0, isDisabled: false });
        } else {
          this.ages.push({ name: 'All', value: 0, isDisabled: false });
        }

        for (const key of Object.keys(res)) {
          this.ages.push({ name: key, value: res[key], isDisabled: false });
        }
      });
  }

  selectedCountries: string = '';

  country!: string;
  countryes!: string[];

  // /PeriodOptions etc.

  titleForChart: string = '';

  quarter: number = 0;
  quarters!: IDropDown[];
  // ----------------------------------------------/SELECTS-------------------------------------------------------------

  // ----------------------------------------------ChangeOptions-------------------------------------------------------------

  selectvTypeChange() {
    am4core.disposeAllCharts();
    this.getSeasonalPerc();
  }

  selecttTypeChange() {
    am4core.disposeAllCharts();

    this.vType = 0;
    this.gender = 0;
    this.age = 0;
    this.country = '';

    this.getSeasonalPerc();
  }

  selectGenderChange() {
    am4core.disposeAllCharts();
    this.getSeasonalPerc();
  }

  selectAgeChange() {
    am4core.disposeAllCharts();
    this.getSeasonalPerc();
  }

  selectCountriesChange() {
    am4core.disposeAllCharts();
    this.getSeasonalPerc();
  }

  // ----------------------------------------------/ChangeOptions-------------------------------------------------------------
  percenetOrNot: number = 1;

  change1() {
    this.percenetOrNot = 1;
  }

  change2() {
    this.percenetOrNot = 2;
  }
  // ----------------------------------------------HTTP Calls-------------------------------------------------------------

  getCountryes(): any {
    let uRl = this.APIUrl + '/countryes?lang=' + this.lang;

    return this.http
      .get<any>(uRl)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.countryes = res;
      });
  }

  getSeasonalPerc() {
    if (this.tType == 3) {
      var url = 'https://tourismapi.geostat.ge/api/Visitors/VisitorFilterLOCAL';
      this.http
        .get<any>(
          url +
            '?tourType=' +
            this.vType +
            '&gender=' +
            this.gender +
            '&age=' +
            this.age +
            '&country=' +
            this.country +
            '&lang=' +
            this.lang
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.createChart(res);
        });
    } else if (this.tType == 1) {
      this.http
        .get<any>(
          'https://tourismapi.geostat.ge/api/Visitors/VisitorFilterIN' +
            '?tour=' +
            this.vType +
            '&gender=' +
            this.gender +
            '&age=' +
            this.age +
            '&country=' +
            this.country +
            '&lang=' +
            this.lang
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.createChart(res);
        });
    } else if (this.tType == 2) {
      this.http
        .get<any>(
          'https://tourismapi.geostat.ge/api/Visitors/VisitorFilterOUT' +
            '?tourType=' +
            this.vType +
            '&gender=' +
            this.gender +
            '&age=' +
            this.age +
            '&country=' +
            this.country +
            '&lang=' +
            this.lang
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          this.createChart(res);
        });
    }
  }

  // ----------------------------------------------/HTTP Calls-------------------------------------------------------------

  createChart(data: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    let chart = am4core.create('chart', am4charts.XYChart);
    chart.logo.disabled = true;

    chart.colors.step = 3;

    if (this.percenetOrNot == 1) {
      if (this.lang == 'GEO') {
        this.titleForChart = 'ვიზიტების რაოდენობა';
      }
      if (this.lang == 'ENG') {
        this.titleForChart = 'Number of Visits';
      }
    } else {
      if (this.lang == 'GEO') {
        this.titleForChart = 'ვიზიტების პროცენტული განაწილება წლების მიხედვით';
      }
      if (this.lang == 'ENG') {
        this.titleForChart = 'Percentage Distribution of Visits by Year';
      }
    }

    chart.maskBullets = false;
    chart.numberFormatter.numberFormat = '#.';
    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    let yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    xAxis.renderer.opposite = true;

    // xAxis.dataFields.category = 'monthName';
    // if (this.tType == 3) {
      xAxis.dataFields.category = 'quarterName';
    // }
    yAxis.dataFields.category = 'yearNo';

    xAxis.renderer.grid.template.disabled = true;
    xAxis.renderer.minGridDistance = 40;

    chart.language.locale['_thousandSeparator'] = ' ';
    yAxis.renderer.grid.template.disabled = true;
    yAxis.renderer.inversed = true;
    yAxis.renderer.minGridDistance = 30;

    let series = chart.series.push(new am4charts.ColumnSeries());

    // series.dataFields.categoryX = 'monthName';

    // if (this.tType == 3) {
      series.dataFields.categoryX = 'quarterName';
    // }
    series.dataFields.categoryY = 'yearNo';

    let field = 'visits';

    if (this.percenetOrNot === 2) {
      field = 'perc';
    }

    series.dataFields.value = field;
    series.sequencedInterpolation = true;
    series.defaultState.transitionDuration = 3000;

    let bgColor = new am4core.InterfaceColorSet().getFor('background');

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 1;
    columnTemplate.strokeOpacity = 1;
    columnTemplate.stroke = bgColor;
    if (this.percenetOrNot === 2) {
      if (this.lang == 'GEO') {
        columnTemplate.tooltipText =
          "{visits.formatNumber('#.0a')} ვიზიტი, წლიური რაოდენობის {perc.formatNumber('#,###.0')}% ";
      }
      if (this.lang == 'ENG') {
        columnTemplate.tooltipText =
          "{visits.formatNumber('#.0a')} Visits, {perc.formatNumber('#,###.0')}% from annual amount ";
      }
    }
    if (this.percenetOrNot === 1) {
      if (this.lang == 'GEO') {
        columnTemplate.tooltipText =
          "{value.workingValue.formatNumber('#.0a')} ვიზიტი ";
      }
      if (this.lang == 'ENG') {
        columnTemplate.tooltipText =
          "{value.workingValue.formatNumber('#.0a')} visits ";
      }
    }

    columnTemplate.width = am4core.percent(100);
    columnTemplate.height = am4core.percent(100);

    series.heatRules.push({
      target: columnTemplate,
      property: 'fill',
      min: am4core.color('#C694FF'),
      max: am4core.color('#2c0d63'),
    });

    // heat legend
    let heatLegend = chart.bottomAxesContainer.createChild(
      am4charts.HeatLegend
    );
    heatLegend.width = am4core.percent(100);
    heatLegend.series = series;
    heatLegend.valueAxis.renderer.labels.template.fontSize = 7;
    heatLegend.valueAxis.renderer.minGridDistance = 30;

    // heat legend behavior
    series.columns.template.events.on('over', function (event) {
      handleHover(event.target);
    });

    series.columns.template.events.on('hit', function (event) {
      handleHover(event.target);
    });
    series.columns.template.events.on('out', function (event) {
      heatLegend.valueAxis.hideTooltip();
    });

    chart.data = data;

    function handleHover(column: any) {
      if (!isNaN(column.dataItem.value)) {
        heatLegend.valueAxis.showTooltipAt(column.dataItem.value);
      } else {
        heatLegend.valueAxis.hideTooltip();
      }
    }

    // chart.legend.hide;

    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.filePrefix = this.titleForChart;
    chart.exporting.menu.items[0].icon =
      '../../../assets/HomePage/download_icon.svg';
    chart.exporting.menu.align = 'right';
    chart.exporting.menu.verticalAlign = 'top';
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    am4core.disposeAllCharts();
  }
}
