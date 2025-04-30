import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElementRef, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest, forkJoin, map, Observable, of } from 'rxjs';
import { SharedService } from 'src/app/shared.service';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

@Component({
  selector: 'app-out-tourism',
  templateUrl: './out-tourism.component.html',
  styleUrls: ['./out-tourism.component.scss'],
})
export class OutTourismComponent implements OnInit {
  [x: string]: any;

  readonly APIUrl: string = 'http://192.168.1.170:3000/api/visitors';
  yearSelect = 2021;
  tourTypeSelect = 0;
  quarterSelect = 0;
  ageSelect = 0;
  genderSelect = 0;

  constructor(
    private http: HttpClient,
    private commonService: SharedService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.createChart('');

    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
    // this.getSeasonalQuery().subscribe((arg) => {
    //   this.createChart(arg);
    // });

    this.getGenders().subscribe((arg) => {
      this.gendersOptions = arg.sort((a: any, b: any) =>
        a.value.localeCompare(b.value)
      );
    });
    this.getAgeGroups().subscribe(
      (args) =>
        (this.agesOptions = args.sort((a: any, b: any) =>
          a.value.localeCompare(b.value)
        ))
    );
    this.getYears().subscribe((arg) => {
      var arry = new Array<number>();
      arg.map((o: any) => {
        arry.push(parseInt(o.id));
        return arry;
      });
      //  console.log(arry);
      this.yearsOptions = arg.sort((a: any, b: any) =>
        a.value.localeCompare(b.value)
      );
      //  console.log(this.sliderLowestVal);
    });
  }

  selectedYear: number = 2021;
  selectedQuarter: number = 0;
  selectedGender: number = 0;
  selectedAge: number = 0;
  tourType: number = 0;

  yearsOptions: any = [];
  gendersOptions: any = [];
  quartersOptions: any = [
    { month: 1, quarter: 1 },
    { month: 2, quarter: 1 },
    { month: 3, quarter: 1 },
    { month: 4, quarter: 2 },
    { month: 5, quarter: 2 },
    { month: 6, quarter: 2 },
    { month: 7, quarter: 3 },
    { month: 8, quarter: 3 },
    { month: 9, quarter: 3 },
    { month: 10, quarter: 4 },
    { month: 11, quarter: 4 },
    { month: 12, quarter: 4 },
  ];

  tourTypes: any = [
    { tourType: 'ტურისტული ვიზიტი', value: 1 },
    { tourType: 'ექსკურსიული ვიზიტი', value: 2 },
  ];

  quarters: any = [
    { quarter: 'I', value: 1 },
    { quarter: 'II', value: 2 },
    { quarter: 'III', value: 3 },
    { quarter: 'IV', value: 4 },
  ];
  agesOptions: any = [];
  Data: any = [];

  // change functions
  selectTourType() {
    this.tourType = this.tourTypeSelect;
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
  }

  selectYearChange() {
    this.selectedYear = this.commonService.getDropDownText(
      this.yearSelect,
      this.yearsOptions
    )[0].value;
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
  }

  selectQuarterChange() {
    this.selectedQuarter = this.quarterSelect;
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
  }

  selectAgeChange() {
    this.selectedAge = this.ageSelect;
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
  }

  selectGenderChange() {
    this.selectedGender = this.genderSelect;
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
    this.getSeasonalQuery()
      .pipe(
        map((res) => {
          return res.map(
            (res: { yearNo: any; quarterNo: any; value: any }) => ({
              quarterNo: res.quarterNo,
              value: res.value | 1,
              yearNo: res.yearNo,
            })
          );
        })
      )
      .subscribe((arg) => {
        this.createChart(arg);
        this.Data = arg;
        // for (let entry of this.Data) {
        //   console.log("dadadada",entry);
        // }
        console.log(this.Data);
      });
  }


  //http calls
  getGenders() {
    return this.http.get<any>(this.APIUrl + '/Genders');
  }
  getAgeGroups() {
    return this.http.get<any>(this.APIUrl + '/AgeGroups');
  }
  getMonths() {
    return this.http.get<any>(this.APIUrl + '/months');
  }
  getYears() {
    return this.http.get<any>(this.APIUrl + '/years');
  }

  getSeasonalQuery() {
    return this.http.get<any>(
      this.APIUrl +
        '/VisitorOut?tourType=' +
        this.tourType +
        '&gender=' +
        this.selectedGender +
        '&age=' +
        this.selectedAge
    );
  }

  IsIncomingSelected: Boolean = true;
  SetIncoming(iStatus: Boolean) {
    this.IsIncomingSelected = iStatus;
  }

  createChart(data: any) {
    am4core.useTheme(am4themes_animated);
    // Themes end

    let chart = am4core.create('chart', am4charts.XYChart);
    chart.maskBullets = false;

    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    let yAxis = chart.yAxes.push(new am4charts.CategoryAxis());

    xAxis.dataFields.category = 'yearNo';
    yAxis.dataFields.category = 'quarterNo';

    xAxis.renderer.grid.template.disabled = true;
    xAxis.renderer.minGridDistance = 40;

    yAxis.renderer.grid.template.disabled = true;
    yAxis.renderer.inversed = true;
    yAxis.renderer.minGridDistance = 30;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = 'yearNo';
    series.dataFields.categoryY = 'quarterNo';
    series.dataFields.value = 'value';
    series.sequencedInterpolation = true;
    series.defaultState.transitionDuration = 3000;

    let bgColor = new am4core.InterfaceColorSet().getFor('background');

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 1;
    columnTemplate.strokeOpacity = 0.6;
    columnTemplate.stroke = bgColor;
    columnTemplate.tooltipText =
      'წელი - {yearNo}, კვარტალი - {quarterNo}, რაოდენობა - {value} ';
    columnTemplate.width = am4core.percent(100);
    columnTemplate.height = am4core.percent(100);

    series.heatRules.push({
      target: columnTemplate,
      property: 'fill',
      min: am4core.color(bgColor),
      max: chart.colors.getIndex(0), //0
    });

    // heat legend
    let heatLegend = chart.bottomAxesContainer.createChild(
      am4charts.HeatLegend
    );
    heatLegend.width = am4core.percent(100);
    heatLegend.series = series;
    heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
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
  }
}
