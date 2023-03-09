import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// Erlaubt das verwenden von Webservices => macht Search Service benutzbar
import { HttpClientModule }    from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { OptionalComponent } from './optional/optional.component';
import { ResultComponent } from './result/result.component';
import { BottomSliderComponent } from './bottom-slider/bottom-slider.component';
//import { FormsModule } from '@angular/forms'

import { DragScrollModule } from 'ngx-drag-scroll';

import { ModalModule } from 'ngx-bootstrap/modal';
//Datepicker stuff   
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common'

//Autocomplete stuff
//import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    OptionalComponent,
    ResultComponent,
    BottomSliderComponent,
  ],
  imports: [
    ModalModule.forRoot(),
    DragScrollModule,
    BrowserModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    //TypeaheadModule.forRoot(),
    AppRoutingModule,
    
    //Enables Search Service
    HttpClientModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }


