import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDropDown } from 'src/app/common/IDropDown';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Observable, Subject, takeUntil } from 'rxjs';
import { BorderService } from './service/border.service';

// Define structure for expected API response (assuming absolute counts per border)
interface IBorderPeriodData {
  period: string; // "YYYY" or "YYYYQQ"
  // Dynamically add properties for each border type name, e.g.:
  // "Sarpi": number;
  // "Tbilisi Airport": number;
  // ... other border names ...
  // countryVisits: { [countryName: string]: number };
  [borderName: string]: any; // Allows dynamic properties for borders + period
}
@Component({
  selector: 'app-border',
  templateUrl: './border.component.html',
  styleUrls: ['./border.component.scss'],
})
export class BorderComponent implements OnInit, OnDestroy {
  readonly APIUrl: string = 'https://tourismapi.geostat.ge/api/International';

  unsubscribe$ = new Subject<void>();

  forYears$!: Observable<number[]>;
  forYearsReverced$!: Observable<number[]>;

  // constructor(private http: HttpClient, private service: BorderService) {
  //   this.service
  //     .GetYears(this.tType)
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((res) => {
  //       this.years = res['normal'];
  //       this.year = res['normal'][0];

  //       this.yearsReverced = res['reversed'];
  //       this.yearEnd = res['reversed'][0];

  //       this.getVisitsChart(
  //         this.year,
  //         this.yearEnd,
  //         this.startM.value,
  //         this.endM.value
  //       );
  //     });

  //   this.lang = localStorage.getItem('Language');
  // }

  lang: any;

  // GetMonthies() {
  //   if (this.lang == 'GEO') {
  //     this.monthies.push({
  //       name: 'აირჩიეთ თვე',
  //       value: 0,
  //       isDisabled: false,
  //     });

  //     this.monthiesEnd.push({
  //       name: 'აირჩიეთ თვე',
  //       value: 0,
  //       isDisabled: false,
  //     });
  //   } else {
  //     this.monthies.push({
  //       name: 'Select a Month',
  //       value: 0,
  //       isDisabled: false,
  //     });

  //     this.monthiesEnd.push({
  //       name: 'Select a Month',
  //       value: 0,
  //       isDisabled: false,
  //     });
  //   }

  //   this.service
  //     .GetMonthies()
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((res) => {
  //       for (const key of Object.keys(res)) {
  //         this.monthies.push({
  //           name: key,
  //           value: res[key],
  //           isDisabled: false,
  //         });

  //         this.monthiesEnd.push({
  //           name: key,
  //           value: res[key],
  //           isDisabled: false,
  //         });
  //       }
  //     });
  // }

  // ngOnInit(): void {
  //   this.GetMonthies();
  // }

  years!: number[];
  year: number = 0;

  yearsReverced!: number[];
  yearEnd: number = 0;

  // monthies: IDropDown[] = [];
  // startM: IDropDown = { name: 'აირჩიეთ თვე', value: 0, isDisabled: false };

  // monthiesEnd: IDropDown[] = [];
  // endM: IDropDown = { name: 'აირჩიეთ თვე', value: 0, isDisabled: false };

  quarters: IDropDown[] = [];
  quartersEnd: IDropDown[] = [];
  startQ: IDropDown = { name: 'Select Quarter', value: 0, isDisabled: false };
  endQ: IDropDown = { name: 'Select Quarter', value: 0, isDisabled: false };

  denger: boolean = false;
  isLoading: boolean = false;
  chartInstance: am4charts.XYChart | null = null;

  // tType: number = 1;

  changedenger() {
    this.denger = false;
  }

  // GetYears(tType: number) {
  //   this.service
  //     .GetYears(tType)
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((res) => {
  //       this.years = res['normal'];
  //       this.year = res['normal'][0];

  //       this.yearsReverced = res['reversed'];
  //       this.yearEnd = res['reversed'][0];
  //     });
  // }

  tType: number = 1; // 1 for incoming (countByBorders), 2 for outgoing (countByBordersExit)

  constructor(private http: HttpClient, private service: BorderService) {
    this.lang = localStorage.getItem('Language') || 'ENG';
    this.fetchInitialYears(); // Fetch years based on default tType=1
  }

  ngOnInit(): void {
    this.GetQuarters(); // Populate quarter dropdowns
     // Set initial quarter dropdown names based on language AFTER lang is set
     const placeholderName = this.lang === 'GEO' ? 'აირჩიეთ კვარტალი' : 'Select a Quarter';
     this.startQ.name = placeholderName;
     this.endQ.name = placeholderName;
  }

  fetchInitialYears() {
    this.service
      .GetYears(this.tType) // Fetch years based on current tType
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.years = res?.['normal'] ?? [];
        this.year = this.years[0] ?? new Date().getFullYear() - 1;

        this.yearsReverced = res?.['reversed'] ?? [];
        this.yearEnd = this.yearsReverced[0] ?? new Date().getFullYear();

        // Don't fetch chart initially
      }, error => console.error("Error fetching years:", error));
  }

  GetQuarters() {
    this.quarters = []; // Clear existing
    this.quartersEnd = [];
    const placeholderName = this.lang === 'GEO' ? 'აირჩიეთ კვარტალი' : 'Select a Quarter';

    this.quarters.push({ name: placeholderName, value: 0, isDisabled: false });
    this.quartersEnd.push({ name: placeholderName, value: 0, isDisabled: false });

    for (let i = 1; i <= 4; i++) {
        const qName = this.getQuarterNameHelper(i, this.lang);
        this.quarters.push({ name: qName, value: i, isDisabled: false });
        this.quartersEnd.push({ name: qName, value: i, isDisabled: false });
     }
     // Or fetch from service if applicable
  }
  // Helper to get quarter name (use the one from previous component)
  getQuarterNameHelper(quarterNum: number, lang: string): string {
    if (lang && lang.toLowerCase() === "geo") {
            switch(quarterNum) {
                case 1: return "I კვარტალი"; case 2: return "II კვარტალი";
                case 3: return "III კვარტალი"; case 4: return "IV კვარტალი";
                default: return "?";
            }
      } else {
            const romanNumeral = quarterNum === 1 ? "I" : quarterNum === 2 ? "II" : quarterNum === 3 ? "III" : quarterNum === 4 ? "IV" : "?";
          return `${romanNumeral} Quarter`;
      }
  }
  changeFlag(flag: number) {
    if (this.tType !== flag) {
        this.tType = flag;
        this.fetchInitialYears(); // Re-fetch years based on the new type
         // Optionally clear/reset the chart when type changes
         if (this.chartInstance) {
            this.chartInstance.dispose();
            this.chartInstance = null;
         }
         const chartDiv = document.getElementById('topChart'); // Use the correct chartDiv ID
         if (chartDiv) chartDiv.innerHTML = ''; // Clear previous chart/message
    }
  }
  // getChart() {
  //   if (
  //     Number(this.year) >= Number(this.yearEnd) &&
  //     Number(this.startM.value) > Number(this.endM.value)
  //   ) {
  //     this.denger = true;
  //   } else {
  //     if (this.startM.value == 0 && this.endM.value != 0) {
  //       this.getVisitsChart(this.year, this.yearEnd, 1, this.endM.value);
  //     } else if (this.endM.value == 0 && this.startM.value != 0) {
  //       this.getVisitsChart(this.year, this.yearEnd, this.startM.value, 12);
  //     } else {
  //       this.getVisitsChart(
  //         this.year,
  //         this.yearEnd,
  //         this.startM.value,
  //         this.endM.value
  //       );
  //     }
  //   }
  // }
    // Triggered by the "Compare" button
    getChart() {
      this.denger = false; // Reset danger flag
  
      // Validation logic using Quarter values
      if (Number(this.year) > Number(this.yearEnd)) {
        this.denger = true; return;
      }
      if ( Number(this.year) === Number(this.yearEnd) &&
           this.startQ.value > 0 && this.endQ.value > 0 &&
           Number(this.startQ.value) > Number(this.endQ.value) ) {
        this.denger = true; return;
      }
  
      // Fetch data using the selected parameters
      this.getVisitsDataAndDrawChart(this.year, this.yearEnd, this.startQ.value, this.endQ.value);
    }
    getVisitsDataAndDrawChart( stY: number, enY: number, stQ: number, enQ: number ) {
      this.isLoading = true;
      if (this.chartInstance) {
         this.chartInstance.dispose();
         this.chartInstance = null;
      }
  
      // Determine API endpoint based on tType
      // *** Assume backend endpoints are renamed and accept Quarter params ***
      const endpointName = this.tType === 1 ? '/countByBorders' : '/countByBordersExit'; // *** USE NEW ENDPOINT NAMES ***
  
      const apiUrl = `${this.APIUrl}${endpointName}?start=${stY}&end=${enY}&startQ=${stQ}&endQ=${enQ}&lang=${this.lang}`;
  
      this.http.get<IBorderPeriodData[]>(apiUrl) // Use the interface
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
           next: (data) => {
              if (data && data.length > 0) {
                  // Sort keys alphabetically for consistent series order (optional)
                  // This happens *after* getting data, before charting
                  const sortedData = data.map(item => {
                      const sortedVisits: { [key: string]: number } = {};
                      Object.keys(item['countryVisits']) // Assuming backend returns countryVisits dictionary now
                            .sort()
                            .forEach(key => sortedVisits[key] = item['countryVisits'][key]);
                      return { ...item, countryVisits: sortedVisits };
                  });
                  this.helpChart(sortedData, 'topChart'); // Draw chart with sorted data
              } else {
                  console.log("No border data returned from API.");
                  const chartDiv = document.getElementById('topChart'); // Use correct ID
                  if (chartDiv) chartDiv.innerHTML = 'No data available for selected period.';
              }
              this.isLoading = false;
           },
           error: (err) => {
              console.error("API Error fetching border data:", err);
              this.isLoading = false;
              const chartDiv = document.getElementById('topChart'); // Use correct ID
              if (chartDiv) chartDiv.innerHTML = 'Error loading chart data.';
           }
        });
    }
  getVisitsChart(st: number, en: number, stM: number, enM: number) {
    if (this.tType == 1) {
      this.http
        .get<any>(
          this.APIUrl +
            '/countByBorders?start=' +
            st +
            '&end=' +
            en +
            '&startM=' +
            stM +
            '&endM=' +
            enM +
            '&lang=' +
            this.lang
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((data) => {
          let resUpdated = data.map((i: any) => {
            return Object.keys(i)
              .sort()
              .reduce(function (result: any, key) {
                result[key] = i[key];
                return result;
              }, {});
          });
          this.helpChart(resUpdated, 'topChart');
        });
    } else {
      this.http
        .get<any>(
          this.APIUrl +
            '/countByBordersExit?start=' +
            st +
            '&end=' +
            en +
            '&startM=' +
            stM +
            '&endM=' +
            enM +
            '&lang=' +
            this.lang
        )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((data) => {
          let resUpdated = data.map((i: any) => {
            return Object.keys(i)
              .sort()
              .reduce(function (result: any, key) {
                result[key] = i[key];
                return result;
              }, {});
          });
          this.helpChart(resUpdated, 'topChart');
        });
    }
  }

  reload() {
    window.location.reload();
  }
  // Refactored helpChart for border counts
  helpChart(apiData: IBorderPeriodData[], chartDivId: string) {
    am4core.useTheme(am4themes_animated);
    let chart = am4core.create(chartDivId, am4charts.XYChart);
    this.chartInstance = chart;

    // --- Prepare Data for Charting ---
    // Get border names (series) from the keys of the first data point's visit dictionary
    const borderNames = (apiData[0]?.['countryVisits']) ? Object.keys(apiData[0]['countryVisits']) : []; // Use Optional Chaining

    // Transform data for amCharts
    const chartData = apiData.map(periodData => {
        const displayPeriod = this.formatPeriodForDisplay(periodData.period, this.lang);
        const chartItem: any = {
            periodRaw: periodData.period,
            displayPeriod: displayPeriod
        };
        // Add each border's visit count as a property
        borderNames.forEach(border => {
            // chartItem[border] = periodData.countryVisits[border] ?? 0;
            chartItem[border] = periodData['countryVisits'][border] ?? 0;
        });
        return chartItem;
    });

    chart.data = chartData;

    // --- Configure X Axis (Category) ---
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'displayPeriod'; // Use the formatted period
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    // categoryAxis.renderer.labels.template.rotation = -45; // Consider rotation if needed

    // --- Configure Y Axis (Value) ---
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#,###"; // Absolute counts
    valueAxis.renderer.grid.template.location = 0;
    valueAxis.min = 0; // Start Y axis at 0
    valueAxis.strictMinMax = true;
    const yAxisTitle = this.tType === 1 ?
                      (this.lang === 'GEO' ? 'შემომსვლელთა რაოდენობა' : 'Number of Incoming') :
                      (this.lang === 'GEO' ? 'გამსვლელთა რაოდენობა' : 'Number of Outgoing');
    valueAxis.title.text = yAxisTitle;


    // --- Create Series for each Border ---
    borderNames.forEach((borderName: string) => {
      this.createSeries(borderName, borderName, chart);
    });

    // --- Legend (Now needed again as we have multiple series) ---
    chart.legend = new am4charts.Legend();
    let legendContainer = am4core.create('legenddiv', am4core.Container);
     if (legendContainer) {
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100); // Adjust height if needed
        legendContainer.logo.disabled = true;
        chart.legend.parent = legendContainer;
        chart.legend.scrollable = true; // Make legend scrollable
        chart.legend.maxHeight = 450; // Limit legend height (adjust as needed)
    }
    chart.legend.useDefaultMarker = true;


    // --- Cursor and Scrollbar ---
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;
    let scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX = scrollbarX;

    // --- Exporting ---
    chart.logo.disabled = true;
    chart.exporting.menu = new am4core.ExportMenu();
    const exportPrefix = this.tType === 1 ?
                        (this.lang === 'ENG' ? 'Visits By Borders Incoming' : 'ვიზიტები საზღვრების მიხედვით შემომსვლელი') :
                        (this.lang === 'ENG' ? 'Visits By Borders Outgoing' : 'ვიზიტები საზღვრების მიხედვით გამსვლელი');
    chart.exporting.filePrefix = exportPrefix;
    // ... rest of export config ...
  }
  // Helper to format period (Same as before)
  formatPeriodForDisplay(period: string, lang: string): string {
    if (!period) return "N/A";
    if (period.length === 4) { return period; }
    else if (period.length === 6) {
       const year = period.slice(0, 4);
       const quarterNum = parseInt(period.slice(4), 10);
       const quarterName = this.getQuarterNameHelper(quarterNum, lang);
       return `${quarterName}, ${year}`;
    }
    return period;
}
  // changeFlag(flag: number) {
  //   this.tType = flag;
  // }

  // helpChart(res: any, chart: any, chartDiv: string) {
  //   am4core.useTheme(am4themes_animated);
  //   // Themes end

  //   // Create chart instance
  //   chart = am4core.create(chartDiv, am4charts.XYChart);
  //   let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  //   categoryAxis.dataFields.category = 'year';
  //   categoryAxis.renderer.grid.template.location = 0;

  //   let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

  //   valueAxis.numberFormatter = new am4core.NumberFormatter();
  //   valueAxis.numberFormatter.numberFormat = '#.%';
  //   valueAxis.renderer.grid.template.location = 0;
  //   if (this.lang == 'GEO') {
  //     valueAxis.title.text = 'პროცენტი';
  //   }
  //   if (this.lang == 'ENG') {
  //     valueAxis.title.text = 'Percent';
  //   }

  //   if (Number(this.startM.value) != 0 || Number(this.endM.value != 0)) {
  //     res.forEach((element: { year: string }) => {
  //       let st: string = '';

  //       st = String(element.year);

  //       let stY: string = st.slice(0, 4);

  //       let stQ: string = st.slice(5);

  //       if (stQ == '1') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'იან, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Jan, ';
  //         }
  //       } else if (stQ == '2') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'თებ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Feb, ';
  //         }
  //       } else if (stQ == '3') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'მარ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Mar, ';
  //         }
  //       } else if (stQ == '4') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'აპრ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Apr, ';
  //         }
  //       } else if (stQ == '5') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'მაი, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'May, ';
  //         }
  //       } else if (stQ == '6') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'ივნ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Jun, ';
  //         }
  //       } else if (stQ == '7') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'ივლ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Jul, ';
  //         }
  //       } else if (stQ == '8') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'აგვ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Aug, ';
  //         }
  //       } else if (stQ == '9') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'სექ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Sep, ';
  //         }
  //       } else if (stQ == '10') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'ოქტ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Oct, ';
  //         }
  //       } else if (stQ == '11') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'ნოე, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Nov, ';
  //         }
  //       } else if (stQ == '12') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'დეკ, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'Dec, ';
  //         }
  //       }

  //       let fnSt: string = `${stQ} ${stY}`;

  //       element.year = fnSt;
  //     });
  //   }

  //   chart.data = res;
  //   let ser: am4charts.LineSeries;

  //   if (this.lang == 'ENG') {
  //     ser = this.createSeries('void', 'All', chart, 'All');
  //   } else {
  //     ser = this.createSeries('void', 'სულ', chart, 'სულ');
  //   }

  //   Object.keys(res[0])
  //     .filter((x) => x != 'year')
  //     .forEach((element: string) => {
  //       this.createSeries(element, element, chart, element);
  //     });

  //   // this.borderTypes.forEach(element => {
  //   //   this.createSeries(element, element, chart, element);
  //   // });

  //   //let allSer = chart.series

  //   ser.events.on('hidden', function () {
  //     chart.series.values.forEach(function (series: {
  //       name: any;
  //       show: () => void;
  //       hide: () => void;
  //     }) {
  //       series.hide();
  //     });
  //   });

  //   ser.events.on('shown', function () {
  //     chart.series.values.forEach(function (series: {
  //       name: any;
  //       show: () => void;
  //       hide: () => void;
  //     }) {
  //       series.show();
  //     });
  //   });

  //   chart.legend = new am4charts.Legend();

  //   let legendContainer = am4core.create('legenddiv', am4core.Container);
  //   legendContainer.width = am4core.percent(100);
  //   legendContainer.height = am4core.percent(100);
  //   legendContainer.logo.disabled = true;
  //   chart.legend.parent = legendContainer;

  //   //chart.legend.logo.disabled = true;

  //   // chart.legend.maxHeight = 50;
  //   // chart.legend.scrollable = true;

  //   chart.legend.useDefaultMarker = true;

  //   //chart.legend.scrollable = true;
  //   chart.legend.scrollable = true;

  //   chart.exporting.menu = new am4core.ExportMenu();
  //   chart.exporting.filePrefix =
  //     this.lang === 'EN'
  //       ? 'Number of visits By Borders'
  //       : 'ვიზიტების რაოდენობა საზღვრების მიხედვით';
  //   // new am4core.ExportMenu();
  //   chart.exporting.menu.items[0].icon =
  //     '../../../assets/HomePage/download_icon.svg';
  //   chart.exporting.menu.align = 'right';
  //   chart.exporting.menu.verticalAlign = 'top';
  //   chart.logo.disabled = true;
  //   let scrollbarX = new am4core.Scrollbar();
  //   chart.scrollbarX = scrollbarX;
  // }

  // createSeries(field: string, name: string, chart: any, ragac: string) {
  //   // Set up series
  //   let series = chart.series.push(new am4charts.LineSeries());

  //   // series.stroke = am4core.color("#ff0000"); // red
  //   series.strokeWidth = 3;

  //   series.dataFields.categoryX = 'year';
  //   series.dataFields.valueY = field;

  //   series.name = name;

  //   chart.language.locale['_thousandSeparator'] = ' ';
  //   chart.numberFormatter.numberFormat = '#.';
  //   chart.logo.disabled = true;

  //   series.strokeWidth = 2;
  //   series.tensionX = 0.7;

  //   var bullet = series.bullets.push(new am4charts.CircleBullet());
  //   bullet.circle.stroke = am4core.color('#fff');
  //   bullet.circle.strokeWidth = 2;

  //   if (this.lang == 'GEO') {
  //     // if (this.tType == 1) {
  //     //   bullet.tooltipText =
  //     //     '[bold]{name}[/]დან შემომსვლელ ვიზიტების რაოდენობა, საწყის პერიოდთან შედარებით,\n{year} წელს შეიცვალა [bold]{valueY.formatNumber("#.%")}-ით';
  //     // } else {
  //     //   bullet.tooltipText =
  //     //     '[bold]{name}[/]დან გამსვლელ ვიზიტების რაოდენობა, საწყის პერიოდთან შედარებით,\n{year} წელს შეიცვალა [bold]{valueY.formatNumber("#.%")}-ით';
  //     // }

  //     bullet.tooltipText =
  //       '[bold]{name}[/]დან ვიზიტების რაოდენობა, საწყის პერიოდთან შედარებით,\n{year} წელს შეიცვალა [bold]{valueY.formatNumber("#.%")}-ით';
  //   }
  //   if (this.lang == 'ENG') {
  //     // if (this.tType == 1) {
  //     //   bullet.tooltipText =
  //     //     'Number of incoming visits by [bold]{name}[/], compared to the initial period,\nin {year} year has changed by [bold]{valueY.formatNumber("#.%")}';
  //     // } else {
  //     //   bullet.tooltipText =
  //     //     'Number of outgoing visits by [bold]{name}[/], compared to the initial period,\nin {year} year has changed by [bold]{valueY.formatNumber("#.%")}';
  //     // }

  //     bullet.tooltipText =
  //       'Number of visits by [bold]{name}[/], compared to the initial period,\nin {year} year has changed by [bold]{valueY.formatNumber("#.%")}';
  //   }

  //   let shadow = new am4core.DropShadowFilter();
  //   shadow.dx = 1;
  //   shadow.dy = 1;
  //   bullet.filters.push(shadow);

  //   chart.logo.disabled = true;

  //   // series.template.tooltipText = "{name}: {categoryX}: {valueY}";

  //   return series;
  // }
  // Updated createSeries for absolute border counts
  createSeries(field: string, name: string, chart: am4charts.XYChart) {
    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = field; // Data comes from property named after the border
    series.dataFields.categoryX = 'displayPeriod'; // Match X axis
    series.name = name; // Legend name
    series.strokeWidth = 2;
    series.tensionX = 0.7;

    var bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.stroke = am4core.color('#fff');
    bullet.circle.strokeWidth = 2;

    // Tooltip for absolute counts per border
    const tooltipBase = this.tType === 1 ?
                        (this.lang === 'GEO' ? 'შემომსვლელი' : 'Incoming') :
                        (this.lang === 'GEO' ? 'გამსვლელი' : 'Outgoing');
    if (this.lang == 'GEO') {
      bullet.tooltipText = `[bold]{name}[/]: ${tooltipBase}\n{displayPeriod} პერიოდში: [bold]{valueY.formatNumber('#,###')}[/]`;
    } else { // ENG
      bullet.tooltipText = `[bold]{name}[/]: ${tooltipBase}\nin Period {displayPeriod}: [bold]{valueY.formatNumber('#,###')}[/]`;
    }

    let shadow = new am4core.DropShadowFilter();
    shadow.dx = 1; shadow.dy = 1;
    bullet.filters.push(shadow);

    return series;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.chartInstance) {
      this.chartInstance.dispose();
  }
  }
}
