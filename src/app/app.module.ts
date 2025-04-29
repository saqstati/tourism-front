import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { DefaultIndicatorComponent } from './categories/default-indicator/default-indicator.component';
import { CompareIndicatorsComponent } from './categories/compare-indicators/compare-indicators.component';
import { RegionalAnalysisComponent } from './categories/regional-analysis/regional-analysis.component';
import { SeasonalComponent } from './categories/seasonal/seasonal.component';
import { InteractiveMapComponent } from './categories/interactive-map/interactive-map.component';
import { CategoriesComponent } from './categories/categories.component';
import { SharedService } from './shared.service';
import { AppRoutingModule } from './app-routing.module';
import { HotelsComponent } from './hotels/hotels.component';
import { HtDefaultIndicatorsComponent } from './hotels/ht-default-indicators/ht-default-indicators.component';
import { HtInteractiveMapComponent } from './hotels/ht-interactive-map/ht-interactive-map.component';
import { HtHotelsGeorgiaComponent } from './hotels/ht-hotels-georgia/ht-hotels-georgia.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { AuthHeaderInterceport } from './http-interceptor/auth-header-interceptor';
import { DefaultVarComponent } from './categories/compare-indicators/default-var/default-var.component';
import { AdditionalVarComponent } from './categories/compare-indicators/additional-var/additional-var.component';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DetailedComponent } from './categories/compare-indicators/detailed/detailed.component';
import { RouterModule } from '@angular/router';
import { OutTourismComponent } from './categories/seasonal/out-tourism/out-tourism.component';
import { LocalTourismComponent } from './categories/seasonal/local-tourism/local-tourism.component';
import { InTourismComponent } from './categories/seasonal/in-tourism/in-tourism.component';
import { HeaderComponent } from './header/header.component';
import { headerForMain } from './headeForLanding/headerForMain.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
// import { AngularEmojisModule } from 'angular-emojis';
import { DataRangePickerComponent } from './data-range-picker/data-range-picker.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatRadioModule } from '@angular/material/radio';
import { FilterPipe } from './Pipes/filter.pipe';
import { HighlightDirective } from './Pipes/highlight.pipe';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatIconModule } from '@angular/material/icon';
import { InfoForUserComponent } from './categories/info-for-user/info-for-user.component';
import { Top15Component } from './categories/top15/top15.component';
import { VisitsCountComponent } from './categories/visits-count/visits-count.component';
import { BorderTypeComponent } from './categories/border-type/border-type.component';
import { BorderComponent } from './categories/border/border.component';

import { IndexENComponent } from './categories/english/index/index-en/index-en.component';
import { IndicatorsComponent } from './categories/dashBoard/indicators/indicators.component';
import { EditComponent } from './categories/dashBoard/edit/edit.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    DefaultIndicatorComponent,
    CompareIndicatorsComponent,
    RegionalAnalysisComponent,
    SeasonalComponent,
    InteractiveMapComponent,
    CategoriesComponent,
    HotelsComponent,
    HtDefaultIndicatorsComponent,
    HtInteractiveMapComponent,
    HtHotelsGeorgiaComponent,
    SpinnerComponent,
    DefaultVarComponent,
    AdditionalVarComponent,
    DetailedComponent,
    OutTourismComponent,
    LocalTourismComponent,
    InTourismComponent,
    HeaderComponent,
    headerForMain,
    FooterComponent,
    HomeComponent,
    DataRangePickerComponent,
    HighlightDirective,
    FilterPipe,
    InfoForUserComponent,
    Top15Component,
    VisitsCountComponent,
    BorderTypeComponent,
    BorderComponent,
    IndexENComponent,
    IndicatorsComponent,
    EditComponent,
  ],
  imports: [
    RouterModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    MatSliderModule,
    BrowserAnimationsModule,
    // AngularEmojisModule,
    Ng2SearchPipeModule,
    MatIconModule,
    MatRadioModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    SharedService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHeaderInterceport,
      multi: true,
    },
    HttpClient,
  ],
  exports: [MatSliderModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
