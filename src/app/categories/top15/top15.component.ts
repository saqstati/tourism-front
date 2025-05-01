import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDropDown } from 'src/app/common/IDropDown';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Subject, takeUntil } from 'rxjs';
import { BorderService } from '../border/service/border.service';

interface ITopCountryPeriodData {
  period: string; // "YYYY" or "YYYYQQ"
  countryVisits: { [countryName: string]: number }; // Or double if backend uses double
}

@Component({
  selector: 'app-top15',
  templateUrl: './top15.component.html',
  styleUrls: ['./top15.component.scss'],
})
export class Top15Component implements OnInit, OnDestroy {
  readonly APIUrl: string = 'https://tourismapi.geostat.ge/api/International';

  unsubscribe$ = new Subject<void>();

  constructor(private http: HttpClient, private service: BorderService) {
    this.service
    .GetYearsAll()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((res) => {
      this.years = res['normal'];
      this.year = res['normal'][0] || new Date().getFullYear() -1; // Default start year

      this.yearsReverced = res['reversed'];
      this.yearEnd = res['reversed'][0] || new Date().getFullYear(); // Default end year

        this.getTopChart(
          this.year,
          this.yearEnd,
          this.startM.value,
          this.endM.value
          // this.flag
        );
      });

      this.lang = localStorage.getItem('Language') || 'GEO';
  }

  lang: any;

  GetMonthies() {
    if (this.lang == 'GEO') {
      this.monthies.push({
        name: 'აირჩიეთ თვე',
        value: 0,
        isDisabled: false,
      });

      this.monthiesEnd.push({
        name: 'აირჩიეთ თვე',
        value: 0,
        isDisabled: false,
      });
    } else {
      this.monthies.push({
        name: 'Select a Month',
        value: 0,
        isDisabled: false,
      });

      this.monthiesEnd.push({
        name: 'Select a Month',
        value: 0,
        isDisabled: false,
      });
    }

    this.service
      .GetMonthies()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        for (const key of Object.keys(res)) {
          this.monthies.push({
            name: key,
            value: res[key],
            isDisabled: false,
          });

          this.monthiesEnd.push({
            name: key,
            value: res[key],
            isDisabled: false,
          });
        }
      });
  }

  GetQuarters() {
    // ... (same logic as before to populate 'quarters' and 'quartersEnd') ...
     this.quarters = []; // Clear first
     this.quartersEnd = [];
     const placeholderName = this.lang === 'GEO' ? 'აირჩიეთ კვარტალი' : 'Select a Quarter';
     this.quarters.push({ name: placeholderName, value: 0, isDisabled: false });
     this.quartersEnd.push({ name: placeholderName, value: 0, isDisabled: false });
     // Add quarters 1-4 manually or fetch from service if service provides them
     for (let i = 1; i <= 4; i++) {
        const qName = this.getQuarterNameHelper(i, this.lang); // Use helper
        this.quarters.push({ name: qName, value: i, isDisabled: false });
        this.quartersEnd.push({ name: qName, value: i, isDisabled: false });
     }
     // Or if using service:
     /* this.service.GetQuarters()... subscribe ... */
  }

  // Helper to get quarter name (matches backend/display logic)
  getQuarterNameHelper(quarterNum: number, lang: string): string {
    if (lang && lang.toLowerCase() === "geo")
      { // Georgian Example
             switch(quarterNum) {
                 case 1: return "I კვ.";
                 case 2: return "II კვ.";
                 case 3: return "III კვ.";
                 case 4: return "IV კვ.";
                 default: return "?";
             }
        } else { // Default to English-like
             const romanNumeral = quarterNum === 1 ? "I" : quarterNum === 2 ? "II" : quarterNum === 3 ? "III" : quarterNum === 4 ? "IV" : "?";
            return `${romanNumeral} Q`;
        }
  }

  ngOnInit(): void {
    // this.GetMonthies();
    this.GetQuarters();
  }

  years!: number[];
  year!: number;
  

  comment: String =
    '*იგულისხმება საქართველოს მოქალაქეები, რომლებიც სხვა ქვეყნის რეზიდენტები არიან.';
  yearsReverced!: number[];
  yearEnd!: number;

  monthies: IDropDown[] = [];
  startM: IDropDown = { name: 'აირჩიეთ თვე', value: 0, isDisabled: false };

  monthiesEnd: IDropDown[] = [];
  endM: IDropDown = { name: 'აირჩიეთ თვე', value: 0, isDisabled: false };

  quarters: IDropDown[] = [];
  startQ: IDropDown = { name: 'აირჩიეთ კვარტალი', value: 0, isDisabled: false };

  quartersEnd: IDropDown[] = [];
  endQ: IDropDown = { name: 'აირჩიეთ კვარტალი', value: 0, isDisabled: false };

  flag: number = 1;

  denger: boolean = false;
  isLoading: boolean = false; // Add loading indicator flag
  chartInstance: am4charts.XYChart | null = null; // Hold chart instance

  topCountryes: { [key: string]: string } = {};

  // changeFlag(num: number) {
  //   this.flag = num;
  // }

  getChart() {
    // Reset danger flag
    this.denger = false;

    // Basic validation: End year must be >= start year
    if (Number(this.year) > Number(this.yearEnd)) {
      this.denger = true;
      return; // Stop if invalid year range
    }
    // If same year, end quarter must be >= start quarter (if both > 0)
    if ( Number(this.year) === Number(this.yearEnd) &&
         this.startQ.value > 0 && this.endQ.value > 0 && // Only check if both are selected
         Number(this.startQ.value) > Number(this.endQ.value) )
    {
      this.denger = true;
      return; // Stop if invalid quarter range in same year
    }

    // Fetch data using the selected parameters
    this.getTopChart(this.year, this.yearEnd, this.startQ.value, this.endQ.value);
  }

  changeStartM() {}
  changeEndm() {}

  changeStartQ() { this.denger = false; } // Reset danger on change
  changeEndQ() { this.denger = false; }   // Reset danger on change
  changeStart() { this.denger = false; }  // Reset danger on change
  changeEnd() { this.denger = false; }    // Reset danger on change

  // changedenger() {
  //   this.denger = false;
  // }

  getTopChart(stY: number, enY: number, stQ: number, enQ: number) {
    this.isLoading = true; // Show loading indicator
    // Dispose previous chart if it exists
    if (this.chartInstance) {
       this.chartInstance.dispose();
       this.chartInstance = null;
    }


    // Construct API URL - Use the new endpoint name
    const apiUrl = `${this.APIUrl}/topcountryes_AbsoluteVisits?start=${stY}&end=${enY}&startQ=${stQ}&endQ=${enQ}&lang=${this.lang}`;

    this.http.get<ITopCountryPeriodData[]>(apiUrl) // Use the interface for type safety
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
            if (data && data.length > 0) {
               this.helpChart(data, 'topChart'); // Pass data and div ID
            } else {
                // Handle empty data - maybe show a message? Clear the chart div?
                console.log("No data returned from API for the selected period.");
                // Optionally clear chart div content here
                const chartDiv = document.getElementById('topChart');
                if (chartDiv) chartDiv.innerHTML = 'No data available for selected period.';
            }
            this.isLoading = false; // Hide loading indicator
        },
        error: (err) => {
            console.error("API Error fetching top countries:", err);
            this.isLoading = false; // Hide loading indicator
            // Show error message to user
            const chartDiv = document.getElementById('topChart');
            if (chartDiv) chartDiv.innerHTML = 'Error loading chart data.';
        }
      });
  }

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
  //     valueAxis.title.text = 'ვიზიტები';
  //   }
  //   if (this.lang == 'ENG') {
  //     valueAxis.title.text = 'Visits';
  //   }

  //   // if (Number(this.startM.value) != 0 || Number(this.endM.value != 0)) {
  //   if (Number(this.startQ.value) != 0 || Number(this.endQ.value != 0)) {
  //     res.forEach((element: { year: string }) => {
  //       let st: string = '';

  //       st = String(element.year);

  //       let stY: string = st.slice(0, 4);

  //       let stQ: string = st.slice(4);

  //       if (stQ == '1') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'I კვარტალი, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'I Quarter, ';
  //         }
  //       } else if (stQ == '2') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'II კვარტალი, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'II Quarter, ';
  //         }
  //       } else if (stQ == '3') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'III კვარტალი, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'III Quarter, ';
  //         }
  //       } else if (stQ == '4') {
  //         if (this.lang == 'GEO') {
  //           stQ = 'IV კვარტალი, ';
  //         }
  //         if (this.lang == 'ENG') {
  //           stQ = 'IV Quarter, ';
  //         }
  //       }

  //       // if (stQ == '1') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'იან, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Jan, ';
  //       //   }
  //       // } else if (stQ == '2') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'თებ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Feb, ';
  //       //   }
  //       // } else if (stQ == '3') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'მარ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Mar, ';
  //       //   }
  //       // } else if (stQ == '4') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'აპრ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Apr, ';
  //       //   }
  //       // } else if (stQ == '5') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'მაი, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'May, ';
  //       //   }
  //       // } else if (stQ == '6') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'ივნ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Jun, ';
  //       //   }
  //       // } else if (stQ == '7') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'ივლ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Jul, ';
  //       //   }
  //       // } else if (stQ == '8') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'აგვ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Aug, ';
  //       //   }
  //       // } else if (stQ == '9') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'სექ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Sep, ';
  //       //   }
  //       // } else if (stQ == '10') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'ოქტ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Oct, ';
  //       //   }
  //       // } else if (stQ == '11') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'ნოე, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Nov, ';
  //       //   }
  //       // } else if (stQ == '12') {
  //       //   if (this.lang == 'GEO') {
  //       //     stQ = 'დეკ, ';
  //       //   }
  //       //   if (this.lang == 'ENG') {
  //       //     stQ = 'Dec, ';
  //       //   }
  //       // }

  //       let fnSt: string = `${stQ} ${stY}`;

  //       element.year = fnSt;
  //     });
  //   }
  //   chart.data = res;

  //   let ser: am4charts.LineSeries;

  //   if (this.lang == 'GEO') {
  //     ser = this.createSeries('void', 'სულ', chart, 'სულ');
  //   } else {
  //     ser = this.createSeries('void', 'All', chart, 'All');
  //   }

  //   Object.keys(res[0])
  //     .filter((x) => x != 'year')
  //     .forEach((element: string) => {
  //       this.createSeries(element, element, chart, element);
  //     });

  //   chart.legend = new am4charts.Legend();

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

  //   let legendContainer = am4core.create('legenddiv', am4core.Container);
  //   legendContainer.width = am4core.percent(100);
  //   legendContainer.height = am4core.percent(100);
  //   legendContainer.logo.disabled = true;
  //   chart.legend.parent = legendContainer;

  //   // chart.legend.maxHeight = 50;
  //   // chart.legend.scrollable = true;

  //   chart.legend.useDefaultMarker = true;
  //   // let marker = chart.legend.markers.template.children.getIndex(0);
  //   // marker.cornerRadius(7, 7, 7, 7);
  //   // marker.strokeWidth = 2;
  //   // marker.strokeOpacity = 1;
  //   // marker.stroke = am4core.color("#ccc");
  //   // marker.template.

  //   //chart.cursor = new am4charts.XYCursor();

  //   //chart.legend.markers.template.disabled = true;

  //   chart.logo.disabled = true;
  //   chart.exporting.menu = new am4core.ExportMenu();
  //   chart.exporting.filePrefix =
  //     this.lang === 'EN'
  //       ? 'Top 10 Countries By Number of Visits'
  //       : 'ტოპ 10 ქვეყანა ვიზიტების რაოდენობის მიხედვით';

  //   chart.exporting.menu.items[0].icon =
  //     '../../../assets/HomePage/download_icon.svg';
  //   chart.exporting.menu.align = 'right';
  //   chart.exporting.menu.verticalAlign = 'top';
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
  //   chart.numberFormatter.numberFormat = '#';
  //   chart.logo.disabled = true;

  //   let scrollbarX = new am4core.Scrollbar();
  //   chart.scrollbarX = scrollbarX;

  //   series.strokeWidth = 2;
  //   series.tensionX = 0.7;

  //   var bullet = series.bullets.push(new am4charts.CircleBullet());
  //   bullet.circle.stroke = am4core.color('#fff');
  //   bullet.circle.strokeWidth = 2;

  //   if (this.lang == 'GEO') {
  //     bullet.tooltipText =
  //       '[bold]{name}[/]დან ვიზიტების რაოდენობა, საწყის პერიოდთან შედარებით,\n{year} წელს შეიცვალა [bold]{valueY.formatNumber("#.%")}-ით';
  //   }
  //   if (this.lang == 'ENG') {
  //     bullet.tooltipText =
  //       'From [bold]{name}[/] Number Of Visits, Compared to\n{year} Year, Has Changed By [bold]{valueY.formatNumber("#.%")}';
  //   }

  //   let shadow = new am4core.DropShadowFilter();
  //   shadow.dx = 1;
  //   shadow.dy = 1;
  //   bullet.filters.push(shadow);

  //   // series.template.tooltipText = "{name}: {categoryX}: {valueY}";

  //   return series;
  // }
  // Inside helpChart method...
  helpChart(apiData: ITopCountryPeriodData[], chartDivId: string) {
    am4core.useTheme(am4themes_animated);
    let chart = am4core.create(chartDivId, am4charts.XYChart);
    this.chartInstance = chart; // Store instance for disposal

    // --- Prepare Data for Charting ---
    // Get the list of country names (series) from the first data point
    const countryNames = (apiData[0] && apiData[0].countryVisits) ? Object.keys(apiData[0].countryVisits) : [];

    // Transform data: Convert dictionary to properties for amCharts
    const chartData = apiData.map(periodData => {
        const displayPeriod = this.formatPeriodForDisplay(periodData.period, this.lang);
        const chartItem: any = {
            periodRaw: periodData.period, // Keep original period for potential sorting
            displayPeriod: displayPeriod // Formatted string for axis
        };
        // Add each country's visit count as a property
        countryNames.forEach(country => {
            chartItem[country] = periodData.countryVisits[country] ?? 0; // Use nullish coalescing for safety
        });
        return chartItem;
    });

    chart.data = chartData;

    // --- Configure X Axis (Category) ---
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'displayPeriod'; // Use the formatted display string
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30; // Adjust spacing if needed
    // Optional: Rotate labels if they overlap
    // categoryAxis.renderer.labels.template.rotation = -45;
    // categoryAxis.renderer.labels.template.horizontalCenter = "right";
    // categoryAxis.renderer.labels.template.verticalCenter = "middle";

    // --- Configure Y Axis (Value) ---
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.numberFormatter = new am4core.NumberFormatter();
    valueAxis.numberFormatter.numberFormat = "#,###"; // Format as regular number
    valueAxis.renderer.grid.template.location = 0;
    if (this.lang == 'GEO') {
      valueAxis.title.text = 'ვიზიტების რაოდენობა'; // Update title
    } else {
      valueAxis.title.text = 'Number of Visits'; // Update title
    }

    // --- Create Series for each Country ---
    countryNames.forEach((countryName: string) => {
      // Use countryName directly as field, name
      this.createSeries(countryName, countryName, chart);
    });

    // --- Legend and Exporting ---
    chart.legend = new am4charts.Legend();
    let legendContainer = am4core.create('legenddiv', am4core.Container);
     if (legendContainer) {
        legendContainer.width = am4core.percent(100);
        legendContainer.height = am4core.percent(100);
        legendContainer.logo.disabled = true;
        chart.legend.parent = legendContainer;
    }
    chart.legend.useDefaultMarker = true;
    chart.logo.disabled = true;
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.filePrefix = this.lang === 'ENG' ? 'Top 10 Countries By Visits' : 'ტოპ 10 ქვეყანა ვიზიტების მიხედვით'; // Update prefix
    // ... rest of export config ...

    // --- Cursor and Scrollbar ---
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;

    let scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX = scrollbarX;
  }

  // Helper to format "YYYY" or "YYYYQQ" into a display string
  formatPeriodForDisplay(period: string, lang: string): string {
    if (!period) return "N/A";
    if (period.length === 4) { // Yearly
        return period;
    } else if (period.length === 6) { // Quarterly YYYYQQ
        const year = period.slice(0, 4);
        const quarterNum = parseInt(period.slice(4), 10);
        const quarterName = this.getQuarterNameHelper(quarterNum, lang);
        return `${quarterName}, ${year}`;
    }
    return period; // Fallback
}

  // Simplified createSeries - make sure categoryX matches axis
  // Updated createSeries for absolute values
  createSeries(field: string, name: string, chart: am4charts.XYChart) {
    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = field; // Y value comes from the property named after the country
    series.dataFields.categoryX = 'displayPeriod'; // Match the categoryAxis
    series.name = name;
    series.strokeWidth = 2;
    series.tensionX = 0.7;

    var bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.stroke = am4core.color('#fff');
    bullet.circle.strokeWidth = 2;

    // Update tooltip for absolute values
    if (this.lang == 'GEO') {
      bullet.tooltipText =
        '[bold]{name}[/] ვიზიტები\n{displayPeriod} პერიოდში: [bold]{valueY.formatNumber("#,###")}[/]';
    }
    if (this.lang == 'ENG') {
      bullet.tooltipText =
        '[bold]{name}[/] Visits\nin Period {displayPeriod}: [bold]{valueY.formatNumber("#,###")}[/]';
    }

    let shadow = new am4core.DropShadowFilter();
    shadow.dx = 1; shadow.dy = 1;
    bullet.filters.push(shadow);

    return series;
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    // Dispose chart if it exists
    if (this.chartInstance) {
        this.chartInstance.dispose();
    }
    // am4core.disposeAllCharts(); // Use instance disposal instead if possible
  }
}
