import { Component, OnInit } from '@angular/core';
import { stringify } from 'querystring';
import { Router } from '@angular/router';
import { userInput } from '../userInput/userInput';
//import { start } from 'repl';
import { HomePageDataServiceService } from '../homePageService/home-page-data-service.service'
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  // Autocomplete Stuff
  selectedOriginDest: string;
  selectedEndDest: string;
  places: any[]=[
    {id:1,name: 'Aachen',country:'Deutschland'},
    {id:2,name:'Paris',country:'Frankreich'},
    {id:3,name:'Berlin', country:'Deutschland'},
    {id:4,name:'Hamburg', country:'Deutschland'},
    {id:5,name:'Madrid', country:'Spanien'}
  ];

  // Setzt minimale Datum im Kalendar zu heutige datum
  maxStartDate: Date;
  minDate: Date;
  minEndDate: Date;
  today:string;
  oneWeekLater:string;

  // Setzt minDate zu heute
  constructor(private router: Router, public homePageDataService: HomePageDataServiceService, private datepipe:DatePipe) {
    this.minDate = new Date();
    this.minEndDate=new Date();



  }

  setData(originDest: string,endDest:string,numberOfPeople:number,startDate:string,endDate:string){
    this.homePageDataService.originDest = originDest;
    this.homePageDataService.endDest = endDest;
    this.homePageDataService.numberOfPeople=numberOfPeople;
    this.homePageDataService.startDate=startDate;
    this.homePageDataService.endDate=endDate;
  }

  getDestOnPicClick():string{
    return this.homePageDataService.endDest;
  }

  onValueChange(minEndDate: Date):void{
    this.minEndDate=minEndDate;
  }

  onValueChangeEnd(maxStartDate: Date):void{
    this.maxStartDate=maxStartDate;
  }

  //Button functionality
  onButtonClick(originDest:string,endDest:string,numberOfPeople:number,startDate:string,endDate:string): void{
    if(originDest=="" || endDest == "" || numberOfPeople == 0 || startDate.toString() == ""  || endDate.toString()==""){
      //alert('Bitte füllen Sie alle Felder aus');
    }
    else if(startDate.toString() == 'Invalid date' || endDate.toString() == 'Invalid date'){
    }
    else{
      this.setData(originDest,endDest,numberOfPeople,startDate,endDate);
      this.router.navigate(['/result']);
    }
  }

  ngOnInit(): void {
    let tempToday=new Date();
    this.today= this.datepipe.transform(tempToday,'dd/MM/yyyy');
    tempToday.setDate(tempToday.getDate()+7);
    let tempWeekLater=tempToday;
    this.oneWeekLater=this.datepipe.transform(tempWeekLater,'dd/MM/yyyy');
    this.homePageDataService.endDest='Berlin';
  }

}
