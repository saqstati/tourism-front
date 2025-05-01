import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDropDown } from 'src/app/common/IDropDown';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { BorderService } from '../border/service/border.service';

@Component({
  selector: 'app-visits-count',
  templateUrl: './visits-count.component.html',
  styleUrls: ['./visits-count.component.scss'],
})
export class VisitsCountComponent implements OnInit, OnDestroy {
  readonly APIUrl: string = 'https://tourismapi.geostat.ge/api/International';

  unsubscribe$ = new Subject<void>();

  

  constructor(private http: HttpClient, private service: BorderService) {
    this.lang = localStorage.getItem('Language') || 'ENG'; // Default to ENG if not found

    // Set initial country placeholder based on language
    this.country = this.lang === 'GEO' ? 'ყველა' : 'Total';

    // Fetch initial year data
    this.service
      .GetYearsAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.years = res?.['normal'] ?? []; // Use nullish coalescing for safety
        this.year = this.years[0] ?? new Date().getFullYear() - 1;

        this.yearsReverced = res?.['reversed'] ?? [];
        this.yearEnd = this.yearsReverced[0] ?? new Date().getFullYear();

        // Don't fetch chart initially, wait for button click
        // this.getVisitsChart( this.year, this.yearEnd, this.startQ.value, this.endQ.value, this.country );
      });
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
    // this.GetMonthies();
    this.GetQuarters(); // Populate quarter dropdowns
    this.getCountryes(); // Populate country dropdown
    // Set initial quarter dropdown names based on language AFTER lang is set
    const placeholderName = this.lang === 'GEO' ? 'აირჩიეთ კვარტალი' : 'Select a Quarter';
    this.startQ.name = placeholderName;
    this.endQ.name = placeholderName;
  }
  
  GetQuarters() {
    this.quarters = []; // Clear existing
    this.quartersEnd = [];
    const placeholderName = this.lang === 'GEO' ? 'აირჩიეთ კვარტალი' : 'Select a Quarter';

    // Add "Select" option
    this.quarters.push({ name: placeholderName, value: 0, isDisabled: false });
    this.quartersEnd.push({ name: placeholderName, value: 0, isDisabled: false });

    // Add Quarters 1-4 (can be fetched from service if available)
    for (let i = 1; i <= 4; i++) {
        const qName = this.getQuarterNameHelper(i, this.lang);
        this.quarters.push({ name: qName, value: i, isDisabled: false });
        this.quartersEnd.push({ name: qName, value: i, isDisabled: false });
     }
     // Alternative: Fetch from service
     /*
     this.service.GetQuarters() // Assuming this exists and returns { "Q1": 1, ... }
       .pipe(takeUntil(this.unsubscribe$))
       .subscribe((res) => {
         for (const key of Object.keys(res)) {
           this.quarters.push({ name: key, value: res[key], isDisabled: false, });
           this.quartersEnd.push({ name: key, value: res[key], isDisabled: false, });
         }
       });
     */
  }

    // Helper to get quarter name (matches backend/display logic)
    getQuarterNameHelper(quarterNum: number, lang: string): string {
      if (lang && lang.toLowerCase() === "geo") { // Fixed comparison
            switch(quarterNum) {
                case 1: return "I კვ";
                case 2: return "II კვ";
                case 3: return "III კვ";
                case 4: return "IV კვ";
                default: return "?";
            }
       } else { // Default to English-like
            const romanNumeral = quarterNum === 1 ? "I" : quarterNum === 2 ? "II" : quarterNum === 3 ? "III" : quarterNum === 4 ? "IV" : "?";
           return `${romanNumeral} Q`;
       }
 }
 

  countryes: string[] = [];
  country!: string;

  years!: number[];
  year!: number;

  yearsReverced!: number[];
  yearEnd!: number;

  // monthies: IDropDown[] = [];
  // startM: IDropDown = { name: 'აირჩიეთ თვე', value: 0, isDisabled: false };

  // monthiesEnd: IDropDown[] = [];
  // endM: IDropDown = { name: 'აირჩიეთ თვე', value: 0, isDisabled: false };
  quarters: IDropDown[] = [];
  startQ: IDropDown = { name: 'Select Quarter', value: 0, isDisabled: false }; // Initial placeholder
  quartersEnd: IDropDown[] = [];
  endQ: IDropDown = { name: 'Select Quarter', value: 0, isDisabled: false }; // Initial placeholder
  denger: boolean = false;
  isLoading: boolean = false;
  chartInstance: am4charts.XYChart | null = null;

  getCountryes() {
    this.countryes = []; // Clear existing
    const placeholder = this.lang === 'GEO' ? 'ყველა' : 'Total';
    this.countryes.push(placeholder);
    // Set default selected country AFTER pushing placeholder
    this.country = placeholder;

    // Assuming the API returns string array of country names
    this.http
      .get<string[]>(`${this.APIUrl}/countryes?lang=${this.lang}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
         // Add fetched countries, prevent duplicates just in case
         data.forEach((element) => {
            if (!this.countryes.includes(element)){
                this.countryes.push(element);
            }
         });
      }, error => {
         console.error("Error fetching countries:", error);
         // Handle error appropriately
      });
  }

  changedenger() {
    this.denger = false;
  }

  getVisitChart() { // Renamed from getVisitChart -> getChartData or similar?
    this.denger = false; // Reset danger flag

    // Validation logic using Quarter values
    if (Number(this.year) > Number(this.yearEnd)) {
      this.denger = true;
      return;
    }
    if ( Number(this.year) === Number(this.yearEnd) &&
         this.startQ.value > 0 && this.endQ.value > 0 && // Only check if both quarters selected
         Number(this.startQ.value) > Number(this.endQ.value) )
    {
      this.denger = true;
      return;
    }

    // Call the data fetching function
    this.getVisitsDataAndDrawChart(this.year, this.yearEnd, this.startQ.value, this.endQ.value, this.country);

  }

  getVisitsDataAndDrawChart( stY: number, enY: number, stQ: number, enQ: number, cntr: string ) {
    this.isLoading = true;
    if (this.chartInstance) {
       this.chartInstance.dispose();
       this.chartInstance = null;
    }

    // Construct API URL - *** Needs new endpoint name and params ***
    // Assuming the endpoint will be named 'visitsCountByPeriod' or similar
    // and will take startQ/endQ instead of startM/endM
    const apiEndpoint = '/visitorsCount'; // *** REPLACE with actual endpoint name ***
    const countryParam = (cntr === 'ყველა' || cntr === 'Total') ? '' : cntr; // Send empty string for "All"

    const apiUrl = `${this.APIUrl}${apiEndpoint}?start=${stY}&end=${enY}&startQ=${stQ}&endQ=${enQ}&country=${countryParam}&lang=${this.lang}`;

    // Define expected response structure (adjust if backend returns something else)
    // Assuming backend returns [{ period: "YYYY" or "YYYYQQ", visits: 12345 }, ...]
    interface IVisitPeriodData {
        period: string;
        visits: number; // Or double
        // Add other properties if returned, e.g., countryName if not 'Total'
    }

    this.http.get<IVisitPeriodData[]>(apiUrl)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
         next: (data) => {
            if (data && data.length > 0) {
                this.helpChart(data, 'visitsChart'); // Call chart drawing function
            } else {
                console.log("No visit count data returned from API.");
                const chartDiv = document.getElementById('visitsChart');
                if (chartDiv) chartDiv.innerHTML = 'No data available for selected period.';
            }
            this.isLoading = false;
         },
         error: (err) => {
            console.error("API Error fetching visit counts:", err);
            this.isLoading = false;
            const chartDiv = document.getElementById('visitsChart');
            if (chartDiv) chartDiv.innerHTML = 'Error loading chart data.';
         }
      });
  }

  // Refactored helpChart for visit counts
  helpChart(apiData: any[], chartDivId: string) { // Use 'any[]' or specific interface IVisitPeriodData[]
    am4core.useTheme(am4themes_animated);
    let chart = am4core.create(chartDivId, am4charts.XYChart);
    this.chartInstance = chart;

    // --- Prepare Data ---
    const chartData = apiData.map(item => {
        return {
            periodRaw: item.period, // Keep original period if needed
            displayPeriod: this.formatPeriodForDisplay(item.period, this.lang), // Format for display
            visits: item.visits ?? 0 // Get the visit count
        };
    });

    chart.data = chartData;

    // --- Configure X Axis (Category) ---
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'displayPeriod'; // Use the formatted period
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    // Optional: Rotate labels
    // categoryAxis.renderer.labels.template.rotation = -45;
    // categoryAxis.renderer.labels.template.horizontalCenter = "right";
    // categoryAxis.renderer.labels.template.verticalCenter = "middle";


    // --- Configure Y Axis (Value) ---
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#,###"; // Format as integer/number
    valueAxis.renderer.grid.template.location = 0;
    if (this.lang == 'GEO') {
      valueAxis.title.text = 'ვიზიტების რაოდენობა';
    } else {
      valueAxis.title.text = 'Number of Visits';
    }
     // Make Y-axis start at 0
     valueAxis.min = 0;
     valueAxis.strictMinMax = true;


    // --- Create THE Series (Only one series for total visits) ---
    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'visits'; // Bind to the 'visits' property
    series.dataFields.categoryX = 'displayPeriod'; // Bind to the formatted period
    series.name = (this.country === 'ყველა' || this.country === 'Total') ? (this.lang === 'GEO' ? 'სულ ვიზიტები' : 'Total Visits') : this.country; // Series name
    series.strokeWidth = 2;
    series.tensionX = 0.7;

    var bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.stroke = am4core.color('#fff');
    bullet.circle.strokeWidth = 2;
    bullet.tooltipText = "{displayPeriod}: [bold]{valueY.formatNumber('#,###')}[/]"; // Simple tooltip

    // Remove legend as there's only one series now
    // chart.legend = new am4charts.Legend();

    // --- Cursor and Scrollbar ---
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;
    let scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX = scrollbarX;

    // --- Exporting ---
    chart.logo.disabled = true;
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.filePrefix = this.lang === 'ENG' ? 'Visits Count' : 'ვიზიტების რაოდენობა'; // Update prefix
    // ... rest of export config ...
  }

   // Helper to format "YYYY" or "YYYYQQ" into a display string (Same as before)
   formatPeriodForDisplay(period: string, lang: string): string {
    if (!period) return "N/A";
    if (period.length === 4) { return period; }
    else if (period.length === 6) {
       const year = period.slice(0, 4);
       const quarterNum = parseInt(period.slice(4), 10); // Corrected slice index
       const quarterName = this.getQuarterNameHelper(quarterNum, lang);
       return `${quarterName}, ${year}`;
    }
    return period; // Fallback
}

  // createSeries(field: string, name: string, chart: any, ragac: string) {
  //   // Set up series
  //   let series = chart.series.push(new am4charts.LineSeries());

  //   // series.stroke = am4core.color("#ff0000"); // red
  //   series.strokeWidth = 3;

  //   series.tooltipText = '{yearNo} წელს, {value}';

  //   series.dataFields.categoryX = 'year';
  //   series.dataFields.valueY = field;

  //   series.name = name;

  //   chart.language.locale['_thousandSeparator'] = ' ';
  //   chart.numberFormatter.numberFormat = '#.';
  //   chart.logo.disabled = true;

  //   let scrollbarX = new am4core.Scrollbar();
  //   chart.scrollbarX = scrollbarX;

  //   series.strokeWidth = 3;
  //   series.tensionX = 0.7;
  //   series.bullets.push(new am4charts.CircleBullet());

  //   var bullet = series.bullets.push(new am4charts.CircleBullet());
  //   bullet.circle.stroke = am4core.color('#fff');
  //   bullet.circle.strokeWidth = 3;

  //   if (this.lang == 'GEO') {
  //     if (this.country == 'ყველა') {
  //       bullet.tooltipText =
  //         'საწყის პერიოდთან შედარებით, ვიზიტების საერთო რაოდენობა\n{year} წელს შეიცვალა [bold]{valueY.formatNumber("#.%")}-ით';
  //     } else {
  //       bullet.tooltipText =
  //         '[bold]{name}[/]დან ვიზიტების რაოდენობა, საწყის პერიოდთან შედარებით,\n{year} წელს შეიცვალა [bold]{valueY.formatNumber("#.%")}-ით';
  //     }
  //   }
  //   if (this.lang == 'ENG') {
  //     if (this.country == 'Total') {
  //       bullet.tooltipText =
  //         'Compared to the initial period, in {year} year Total number of visits\n has Changed by [bold]{valueY.formatNumber("#.%")}';
  //     } else {
  //       bullet.tooltipText =
  //         'From [bold]{name}[/] number of visits, compared to\n{year} Year, has Changed By [bold]{valueY.formatNumber("#.%")}';
  //     }
  //   }

  //   return series;
  // }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    // am4core.disposeAllCharts();
    if (this.chartInstance) {
      this.chartInstance.dispose();
  }
  }
}
