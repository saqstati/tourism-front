import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDropDown } from 'src/app/common/IDropDown';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Subject, takeUntil } from 'rxjs';
import { BorderService } from '../border/service/border.service';

// Reuse the same DTO structure or define if slightly different
interface IBorderTypePeriodData {
  period: string; // "YYYY" or "YYYYQQ"
  // Assuming backend returns dictionary: BorderTypeName -> Visits
  countryVisits: { [borderTypeName: string]: number }; // Or double
}
@Component({
  selector: 'app-border-type',
  templateUrl: './border-type.component.html',
  styleUrls: ['./border-type.component.scss'],
})
export class BorderTypeComponent implements OnInit, OnDestroy {
  readonly APIUrl: string = 'https://tourismapi.geostat.ge/api/International';

  unsubscribe$ = new Subject<void>();

  constructor(private http: HttpClient, private service: BorderService) {
    this.lang = localStorage.getItem('Language') || 'ENG';
    this.fetchInitialYears(); // Fetch years based on default tType=1
  }

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

  ngOnInit(): void {
    this.GetQuarters(); // Populate quarter dropdowns
    // Set initial quarter dropdown names based on language AFTER lang is set
    const placeholderName = this.lang === 'GEO' ? 'აირჩიეთ კვარტალი' : 'Select a Quarter';
    this.startQ.name = placeholderName;
    this.endQ.name = placeholderName;

    // Remove fetching borderTypes here if they come from the API response keys directly
    // this.service.GetBorderTypes()...subscribe...
  }

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

  tType: number = 1;

  fetchInitialYears() {
    // Assuming GetYears takes the tType (1=Incoming IN table, 2=Outgoing OUT table)
    this.service
      .GetYears(this.tType)
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
  }

  // Helper to get quarter name (use the one from previous component)
  getQuarterNameHelper(quarterNum: number, lang: string): string {
       if (lang && lang.toLowerCase() === "geo") {
             switch(quarterNum) {
                 case 1: return "I კვ"; case 2: return "II კვ";
                 case 3: return "III კვ"; case 4: return "IV კვ";
                 default: return "?";
             }
        } else {
             const romanNumeral = quarterNum === 1 ? "I" : quarterNum === 2 ? "II" : quarterNum === 3 ? "III" : quarterNum === 4 ? "IV" : "?";
            return `${romanNumeral} Quarter`;
        }
  }

  changedenger() {
    this.denger = false;
  }

    // Triggered when radio button changes tType
    changeFlag(flag: number) {
      if (this.tType !== flag) {
         this.tType = flag;
         this.fetchInitialYears(); // Re-fetch years
         // Clear chart
          if (this.chartInstance) {
             this.chartInstance.dispose();
             this.chartInstance = null;
          }
          const chartDiv = document.getElementById('topChart'); // Use the correct ID
          if (chartDiv) chartDiv.innerHTML = '';
     }
   }

  GetYears(tType: number) {
    this.service
      .GetYears(tType)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.years = res['normal'];
        this.year = res['normal'][0];

        this.yearsReverced = res['reversed'];
        this.yearEnd = res['reversed'][0];
      });
  }

  getVisitsChart(st: number, en: number, stM: number, enM: number) {
    if (this.tType == 1) {
      this.http
        .get<any>(
          this.APIUrl +
            '/countByBorderTypes?start=' +
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
          this.helpChart(data, 'topChart');
        });
    } else {
      this.http
        .get<any>(
          this.APIUrl +
            '/countByBorderTypesExit?start=' +
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
          this.helpChart(data, 'topChart');
        });
    }
  }

  borderTypes: string[] = [];

  getChart() {
    this.denger = false; // Reset danger flag

    // Validation logic using Quarter values
    if (Number(this.year) > Number(this.yearEnd)) { this.denger = true; return; }
    if ( Number(this.year) === Number(this.yearEnd) &&
         this.startQ.value > 0 && this.endQ.value > 0 &&
         Number(this.startQ.value) > Number(this.endQ.value) ) { this.denger = true; return; }

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
    const endpointName = this.tType === 1 ? '/countByBorderTypes' : '/countByBorderTypesExit'; // *** USE NEW ENDPOINT NAMES ***

    const apiUrl = `${this.APIUrl}${endpointName}?start=${stY}&end=${enY}&startQ=${stQ}&endQ=${enQ}&lang=${this.lang}`;

    this.http.get<IBorderTypePeriodData[]>(apiUrl) // Use the specific interface
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
         next: (data) => {
            if (data && data.length > 0) {
                // No need to sort keys here unless legend order matters significantly
                this.helpChart(data, 'topChart'); // Draw chart
            } else {
                console.log("No border type data returned from API.");
                const chartDiv = document.getElementById('topChart'); // Use correct ID
                if (chartDiv) chartDiv.innerHTML = 'No data available for selected period.';
            }
            this.isLoading = false;
         },
         error: (err) => {
            console.error("API Error fetching border type data:", err);
            this.isLoading = false;
            const chartDiv = document.getElementById('topChart'); // Use correct ID
            if (chartDiv) chartDiv.innerHTML = 'Error loading chart data.';
         }
      });
  }

  // Refactored helpChart for border type counts
  helpChart(apiData: IBorderTypePeriodData[], chartDivId: string) {
    am4core.useTheme(am4themes_animated);
    let chart = am4core.create(chartDivId, am4charts.XYChart);
    this.chartInstance = chart;

    // --- Prepare Data for Charting ---
    // Get border type names (series) from the keys of the first data point's visit dictionary
    const borderTypeNames = (apiData[0]?.countryVisits) ? Object.keys(apiData[0].countryVisits) : []; // Use Optional Chaining

    // Transform data for amCharts
    const chartData = apiData.map(periodData => {
        const displayPeriod = this.formatPeriodForDisplay(periodData.period, this.lang);
        const chartItem: any = {
            periodRaw: periodData.period,
            displayPeriod: displayPeriod
        };
        const visitsDict = periodData.countryVisits; // Use correct DTO property name
        // Add each border type's visit count as a property
        borderTypeNames.forEach(typeName => {
             chartItem[typeName] = visitsDict ? (visitsDict[typeName] ?? 0) : 0;
        });
        return chartItem;
    });

    chart.data = chartData;

    // --- Configure X Axis (Category) ---
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'displayPeriod'; // Use the formatted period
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    // ... Optional label rotation ...

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


    // --- Create Series for each Border Type ---
    borderTypeNames.forEach((typeName: string) => {
      this.createSeries(typeName, typeName, chart);
    });

    // --- Legend ---
    chart.legend = new am4charts.Legend();
    let legendContainer = am4core.create('legenddiv', am4core.Container);
     if (legendContainer) {
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100);
        legendContainer.logo.disabled = true;
        chart.legend.parent = legendContainer;
        chart.legend.scrollable = true;
        chart.legend.maxHeight = 150; // Adjust legend height for this layout
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
                        (this.lang === 'ENG' ? 'Visits By Border Types Incoming' : 'ვიზიტები საზღვრის ტიპების მიხედვით შემომსვლელი') :
                        (this.lang === 'ENG' ? 'Visits By Border Types Outgoing' : 'ვიზიტები საზღვრის ტიპების მიხედვით გამსვლელი');
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

  // Updated createSeries for absolute border type counts
  createSeries(field: string, name: string, chart: am4charts.XYChart) {
    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = field; // Data comes from property named after the border type
    series.dataFields.categoryX = 'displayPeriod'; // Match X axis
    series.name = name; // Legend name
    series.strokeWidth = 2;
    series.tensionX = 0.7;

    var bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.stroke = am4core.color('#fff');
    bullet.circle.strokeWidth = 2;

    // Tooltip for absolute counts per border type
    const tooltipBase = this.tType === 1 ?
                        (this.lang === 'GEO' ? 'შემომსვლელი' : 'Incoming') :
                        (this.lang === 'GEO' ? 'გამსვლელი' : 'Outgoing');
    if (this.lang == 'GEO') {
      // Use field which holds the border type name from the data
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
