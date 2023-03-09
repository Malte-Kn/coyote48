import { Component, OnInit, ViewChild, ɵConsole} from '@angular/core';
import { HomePageDataServiceService } from '../homePageService/home-page-data-service.service'
//Search Service Stuff
import { HttpClient } from '@angular/common/http';
//Object Wrapper
import { FlightInterface, Root, Success } from './objectWrapper';
import { TrainInterface } from './objectWrapper';
import { HotelInterface } from './objectWrapper';

import { DragScrollComponent } from 'ngx-drag-scroll';
import { getInterpolationArgsLength } from '@angular/compiler/src/render3/view/util';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
//Vergleichs Modal map stuff

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
  
})




export class ResultComponent implements OnInit {
  
  roomType:string;
  hotelBoardCode:string;
  //Creating arrays for the search results objects

  flightArr: FlightInterface[];
  trainArr: TrainInterface[];
  trainArrback:TrainInterface[];
  hotelArr: HotelInterface[];
  //favArr: HotelInterface[];

  showHotels:boolean;
  showFlights:boolean;
  showTrains: boolean;

  destination: String;
  startDate:String;
  endDate:String;
  airportDest:String;
  trainDest:number;
  trainStart:number;
  numberOfPeople:number;
  //#####FARBAMPEL VARIABLEN ######
  //Daten zur Erfassung der Preisspanne
  maxTravelPrice:number = 0;
  minTravelPrice:number = 0;
  //Daten zur Erfassung der Zeitspanne
  maxTravelDuration:number = 0;
  minTravelDuration:number = 0;
  //Daten zur Erfassung des CO2 Ausstosses
  minCarbonEmission:number = 0;
  maxCarbonEmission:number = 0;
  //Anzahl der Flug/Zug Karten
  cardAnzahl = 50;
  //Chchboxen für Sort
 
  whattoSort:boolean[] = [false,false,false]; 
  //Farbindex 
    
    colors = new Map([
    ['0', '#2dc937'],//Gruen
    ['1', '#4cca26'],
    ['2', '#79cb1f'],
    ['3', '#accc18'],
    ['4', '#cdb711'],
    ['5', '#cd7d0b'],
    ['6', '#cd4005'],
    ['7', '#cd2801'],//Rot
    
  ])
  //speichert anzahl der Farbstufen
  colorRange:number = this.colors.size - 1;
  

  // travel duration
  duration:number=0;
  constructor(private homePageData: HomePageDataServiceService, private http: HttpClient) { 
    
  }

  ngOnInit(): void {
    this.flightArr=[];
    this.trainArrback=[];
    this.trainArr=[];
    this.cardArr=[];
    this.cardArr1=[];
    this.favArrHotel=[];
    this.favArrTravel=[0,1,2,3];
    this.selectedindex =0;
    this.selectedindex1=0;
    this.selectedidentifier = 1;
    this.showHotels= true;
    this.showFlights=true;
    this.showTrains=true;
    this.setEndTrainCode(this.getEndDest());
    this.destination ='destination=' + this.getEndDest().substr(0,3).toUpperCase();
    this.setStartTrainCode(this.getStartDest());

    let formattedEndDate = this.getEndDate().split("/").reverse().join("-");
    let formattedStartDate = this.getStartDate().split("/").reverse().join("-");
    this.duration=(new Date(formattedEndDate).valueOf()-new Date(formattedStartDate).valueOf())/86400000;  // subtracts startDate from Enddate and converts it from ms to days
    this.startDate= formattedStartDate;
    this.endDate = formattedEndDate;
    if(this.getEndDest().toUpperCase()=='BERLIN'){
      this.airportDest='TXL';
    }
    else if(this.getEndDest().toUpperCase()=='PARIS'){
      this.airportDest='CDG';
    }
    else if(this.getEndDest().toUpperCase()=='AMSTERDAM'){
      this.airportDest='AMS';
    }

    if(this.roomType==undefined){
      this.roomType='';
    }
    if(this.hotelBoardCode==undefined){
      this.hotelBoardCode='';
    }
    
    this.numberOfPeople = this.getNumberOfPeople();
    if(this.numberOfPeople >2 && this.numberOfPeople < 5){
        this.roomType = "&room_code=AP"
    }else if(this.numberOfPeople > 4){
      this.roomType = "&room_code=SU"
    }
    //castJSON into Interface Array
    this.http.get<TrainInterface[]>('http://search.mwtt.52.208.6.51.nip.io/train/search'+'?' + '&' +'arrival=' + this.trainDest + '&' +'departure=8000001' +'&' +'date=' + this.startDate).subscribe(data => {
      if(data != undefined){
        this.trainArr = data;
        for(let k=0;k<this.trainArr.length;k++){
          this.trainArr[k].endDestination = this.getTrainDest(this.trainArr[k].arrival);
          this.trainArr[k].startDestination=this.getTrainDest(this.trainArr[k].departure);
          this.trainArr[k].depTime=this.trainArr[k].dep_date_time.split(" ").reverse().join(" ");
          this.trainArr[k].arrTime=this.trainArr[k].arr_date_time.split(" ").reverse().join(" ");
          this.trainArr[k].index=k;
          this.trainArr[k].depForCalculation=this.trainArr[k].dep_date_time.split(" ").join("T");
          this.trainArr[k].arrForCalculation=this.trainArr[k].arr_date_time.split(" ").join("T");
          this.trainArr[k].time=(new Date(this.trainArr[k].arrForCalculation).getTime() - new Date(this.trainArr[k].depForCalculation).getTime())/3600000;
          if(this.trainArr[k].time < 0){
            this.trainArr[k].time = 24 + this.trainArr[k].time ;
          }
          this.trainArr[k].duration=this.toHours(Math.round(this.trainArr[k].time*60));
          this.trainArr[k].price = Math.round(this.trainArr[k].price*100*this.numberOfPeople)/100;
          this.trainArr[k].fulltime =this.trainArr[k].time ;
          this.trainArr[k].auslastung = this.carbonRatingHelper(0,this.trainArr[k].time);
          //speichern der ersten Zeit als referenzwert fuer min reisezeit zug
        }
      }
    }); 
     this.http.get<TrainInterface[]>('http://search.mwtt.52.208.6.51.nip.io/train/search'+'?' + '&' +'arrival=' + this.trainDest + '&' +'departure=8000207' +'&' +'date=' + this.startDate).subscribe(data => {
      var x = this.trainArr.length;
      if(data != undefined){
        this.trainArr = this.trainArr.concat(data);
        for(let k=x;k<this.trainArr.length;k++){
          this.trainArr[k].endDestination = this.getTrainDest(this.trainArr[k].arrival);
          this.trainArr[k].startDestination=this.getTrainDest(this.trainArr[k].departure);
          this.trainArr[k].depTime=this.trainArr[k].dep_date_time.split(" ").reverse().join(" ");
          this.trainArr[k].arrTime=this.trainArr[k].arr_date_time.split(" ").reverse().join(" ");
          this.trainArr[k].index=k;
          this.trainArr[k].depForCalculation=this.trainArr[k].dep_date_time.split(" ").join("T");
          this.trainArr[k].arrForCalculation=this.trainArr[k].arr_date_time.split(" ").join("T");
          this.trainArr[k].time=(new Date(this.trainArr[k].arrForCalculation).getTime() - new Date(this.trainArr[k].depForCalculation).getTime())/3600000;
          this.trainArr[k].duration=this.toHours((new Date(this.trainArr[k].arrForCalculation).getTime() - new Date(this.trainArr[k].depForCalculation).getTime())/60000);
          this.trainArr[k].price = Math.round(this.trainArr[k].price*100*this.numberOfPeople)/100;
          this.trainArr[k].fulltime = this.trainArr[k].time + this.getExtraTimeNum(k,1);
          this.trainArr[k].auslastung = this.carbonRatingHelper(0,this.trainArr[k].fulltime);
          this.trainArr[k].changes =this.trainArr[k].changes+1;
          //speichern der ersten Zeit als referenzwert fuer min reisezeit zug
        }
      }
    }); 
    this.http.get<TrainInterface[]>('http://search.mwtt.52.208.6.51.nip.io/train/search'+'?' + '&' +'arrival=' + this.trainDest + '&' +'departure=8000085' +'&' +'date=' + this.startDate).subscribe(data => {
      var x = this.trainArr.length;
      if(data != undefined){
        this.trainArr = this.trainArr.concat(data);
        for(let k=x;k<this.trainArr.length;k++){
          this.trainArr[k].endDestination = this.getTrainDest(this.trainArr[k].arrival);
          this.trainArr[k].startDestination=this.getTrainDest(this.trainArr[k].departure);
          this.trainArr[k].depTime=this.trainArr[k].dep_date_time.split(" ").reverse().join(" ");
          this.trainArr[k].arrTime=this.trainArr[k].arr_date_time.split(" ").reverse().join(" ");
          this.trainArr[k].index=k;
          this.trainArr[k].depForCalculation=this.trainArr[k].dep_date_time.split(" ").join("T");
          this.trainArr[k].arrForCalculation=this.trainArr[k].arr_date_time.split(" ").join("T");
          this.trainArr[k].time=(new Date(this.trainArr[k].arrForCalculation).getTime() - new Date(this.trainArr[k].depForCalculation).getTime())/3600000;
          this.trainArr[k].duration=this.toHours((new Date(this.trainArr[k].arrForCalculation).getTime() - new Date(this.trainArr[k].depForCalculation).getTime())/60000);
          this.trainArr[k].price = Math.round(this.trainArr[k].price*100*this.numberOfPeople)/100;
          this.trainArr[k].fulltime = this.trainArr[k].time + this.getExtraTimeNum(k,1);
          this.trainArr[k].auslastung = this.carbonRatingHelper(0,this.trainArr[k].fulltime);
          this.trainArr[k].changes =this.trainArr[k].changes+1;
          //speichern der ersten Zeit als referenzwert fuer min reisezeit zug
          
        }
      }
    });
    this.http.get<TrainInterface[]>('http://search.mwtt.52.208.6.51.nip.io/train/search'+'?' + '&' +'arrival=' + this.trainDest + '&' +'departure=8000105' +'&' +'date=' + this.startDate).subscribe(data => {
      var x = this.trainArr.length;
      if(data != undefined){
        this.trainArr = this.trainArr.concat(data);
        for(let k=x;k<this.trainArr.length;k++){
          this.trainArr[k].endDestination = this.getTrainDest(this.trainArr[k].arrival);
          this.trainArr[k].startDestination=this.getTrainDest(this.trainArr[k].departure);
          this.trainArr[k].depTime=this.trainArr[k].dep_date_time.split(" ").reverse().join(" ");
          this.trainArr[k].arrTime=this.trainArr[k].arr_date_time.split(" ").reverse().join(" ");
          this.trainArr[k].index=k;
          this.trainArr[k].depForCalculation=this.trainArr[k].dep_date_time.split(" ").join("T");
          this.trainArr[k].arrForCalculation=this.trainArr[k].arr_date_time.split(" ").join("T");
          this.trainArr[k].time=(new Date(this.trainArr[k].arrForCalculation).getTime() - new Date(this.trainArr[k].depForCalculation).getTime())/3600000;
          this.trainArr[k].duration=this.toHours((new Date(this.trainArr[k].arrForCalculation).getTime() - new Date(this.trainArr[k].depForCalculation).getTime())/60000);
          this.trainArr[k].price = Math.round(this.trainArr[k].price*100*this.numberOfPeople)/100;
          this.trainArr[k].fulltime = this.trainArr[k].time + this.getExtraTimeNum(k,1);
          this.trainArr[k].auslastung = this.carbonRatingHelper(0,this.trainArr[k].fulltime);
          this.trainArr[k].changes =this.trainArr[k].changes+1;
          
        }
      }
      this.setMinMax();
      
    });
//castJSON into Interface Array
    this.http.get<TrainInterface[]>('http://search.mwtt.52.208.6.51.nip.io/train/search'+'?' + '&'  +'departure=' + this.trainDest + '&' +'arrival=8000001' + '&' + 'date=' + this.endDate).subscribe(data => {
    if(data != undefined){  
      this.trainArrback =data;

        
        for(let k=0;k<this.trainArrback.length;k++){
          this.trainArrback[k].index=k;
          this.trainArrback[k].price = Math.round(this.trainArrback[k].price*100*this.numberOfPeople)/100;
          this.trainArrback[k].startDestination=this.getTrainDest(this.trainArrback[k].departure);
          this.trainArrback[k].endDestination = this.getTrainDest(this.trainArrback[k].arrival);
          this.trainArrback[k].depTime=this.trainArrback[k].dep_date_time.split(" ").reverse().join(" ");
          this.trainArrback[k].arrTime=this.trainArrback[k].arr_date_time.split(" ").reverse().join(" ");
          this.trainArrback[k].auslastung=  Math.floor(Math.random() * Math.floor(3))+1;
          this.trainArrback[k].depForCalculation=this.trainArrback[k].dep_date_time.split(" ").join("T");
          this.trainArrback[k].arrForCalculation=this.trainArrback[k].arr_date_time.split(" ").join("T");
          this.trainArrback[k].time=(new Date(this.trainArrback[k].arrForCalculation).getTime() - new Date(this.trainArrback[k].depForCalculation).getTime())/3600000;
          if(this.trainArrback[k].time < 0){
            this.trainArrback[k].time = 24 + this.trainArrback[k].time ;
          }
          this.trainArrback[k].fulltime = this.trainArrback[k].time;
          this.trainArrback[k].duration=this.toHours(Math.round(this.trainArrback[k].time*60));
        }
      } 
    });
   //castJSON into Interface Array
   this.http.get<TrainInterface[]>('http://search.mwtt.52.208.6.51.nip.io/train/search'+'?' + '&'  +'departure=' + this.trainDest + '&' +'arrival=8000207' + '&' + 'date=' + this.endDate).subscribe(data => {
   var y = this.trainArrback.length;
   if(data != undefined){
    this.trainArrback =  this.trainArrback.concat(data);

      
      for(let k=y;k<this.trainArrback.length;k++){
        this.trainArrback[k].index=k;
        this.trainArrback[k].price = Math.round(this.trainArrback[k].price*100*this.numberOfPeople)/100;
        this.trainArrback[k].startDestination=this.getTrainDest(this.trainArrback[k].departure);
        this.trainArrback[k].endDestination = this.getTrainDest(this.trainArrback[k].arrival);
        this.trainArrback[k].depTime=this.trainArrback[k].dep_date_time.split(" ").reverse().join(" ");
        this.trainArrback[k].arrTime=this.trainArrback[k].arr_date_time.split(" ").reverse().join(" ");
        this.trainArrback[k].auslastung=  Math.floor(Math.random() * Math.floor(3))+1;
        this.trainArrback[k].depForCalculation=this.trainArrback[k].dep_date_time.split(" ").join("T");
        this.trainArrback[k].arrForCalculation=this.trainArrback[k].arr_date_time.split(" ").join("T");
        this.trainArrback[k].time=(new Date(this.trainArrback[k].arrForCalculation).getTime() - new Date(this.trainArrback[k].depForCalculation).getTime())/3600000;
        this.trainArrback[k].duration=this.toHours((new Date(this.trainArrback[k].arrForCalculation).getTime() - new Date(this.trainArrback[k].depForCalculation).getTime())/60000);
        
      }
   }
  });
  //castJSON into Interface Array
  this.http.get<TrainInterface[]>('http://search.mwtt.52.208.6.51.nip.io/train/search'+'?' + '&'  +'departure=' + this.trainDest + '&' +'arrival=8000085' + '&' + 'date=' + this.endDate).subscribe(data => {
    var y = this.trainArrback.length;
    if(data != undefined){
      this.trainArrback =  this.trainArrback.concat(data);
      
      for(let k=y;k<this.trainArrback.length;k++){
        this.trainArrback[k].index=k;
        this.trainArrback[k].price = Math.round(this.trainArrback[k].price*100*this.numberOfPeople)/100;
        this.trainArrback[k].startDestination=this.getTrainDest(this.trainArrback[k].departure);
        this.trainArrback[k].endDestination = this.getTrainDest(this.trainArrback[k].arrival);
        this.trainArrback[k].depTime=this.trainArrback[k].dep_date_time.split(" ").reverse().join(" ");
        this.trainArrback[k].arrTime=this.trainArrback[k].arr_date_time.split(" ").reverse().join(" ");
        this.trainArrback[k].auslastung=  Math.floor(Math.random() * Math.floor(3))+1;
        this.trainArrback[k].depForCalculation=this.trainArrback[k].dep_date_time.split(" ").join("T");
        this.trainArrback[k].arrForCalculation=this.trainArrback[k].arr_date_time.split(" ").join("T");
        this.trainArrback[k].time=(new Date(this.trainArrback[k].arrForCalculation).getTime() - new Date(this.trainArrback[k].depForCalculation).getTime())/3600000;
        this.trainArrback[k].duration=this.toHours((new Date(this.trainArrback[k].arrForCalculation).getTime() - new Date(this.trainArrback[k].depForCalculation).getTime())/60000);
      }
    }
  });
  //castJSON into Interface Array
  this.http.get<TrainInterface[]>('http://search.mwtt.52.208.6.51.nip.io/train/search'+'?' + '&'  +'departure=' + this.trainDest + '&' +'arrival=8000105' + '&' + 'date=' + this.endDate).subscribe(data => {
    var y = this.trainArrback.length;
    if(data != undefined){
      this.trainArrback =  this.trainArrback.concat(data);
      
      for(let k=y;k<this.trainArrback.length;k++){
        this.trainArrback[k].index=k;
        this.trainArrback[k].price = Math.round(this.trainArrback[k].price*100*this.numberOfPeople)/100;
        this.trainArrback[k].startDestination=this.getTrainDest(this.trainArrback[k].departure);
        this.trainArrback[k].endDestination = this.getTrainDest(this.trainArrback[k].arrival);
        this.trainArrback[k].depTime=this.trainArrback[k].dep_date_time.split(" ").reverse().join(" ");
        this.trainArrback[k].arrTime=this.trainArrback[k].arr_date_time.split(" ").reverse().join(" ");
        this.trainArrback[k].auslastung=  Math.floor(Math.random() * Math.floor(3))+1;
        this.trainArrback[k].depForCalculation=this.trainArrback[k].dep_date_time.split(" ").join("T");
        this.trainArrback[k].arrForCalculation=this.trainArrback[k].arr_date_time.split(" ").join("T");
        this.trainArrback[k].time=(new Date(this.trainArrback[k].arrForCalculation).getTime() - new Date(this.trainArrback[k].depForCalculation).getTime())/3600000;
        this.trainArrback[k].duration=this.toHours((new Date(this.trainArrback[k].arrForCalculation).getTime() - new Date(this.trainArrback[k].depForCalculation).getTime())/60000);
      }
    }
    this.setMinMax();
  });
    this.http.get<FlightInterface[]>('http://search.mwtt.52.208.6.51.nip.io/flight/search'+'?'+'outbound_arr_airport='+ this.airportDest+'&'+'date='+this.startDate +'&'+'duration='+this.duration).subscribe(data => {
      this.flightArr = data;

      //init der Ampel Grenzwerte
      for(let l=0;l<this.flightArr.length;l++){
        this.flightArr[l].index = l;
        //DEBUG PRICE ADDER #######################################
        this.flightArr[l].price = this.flightArr[l].price*this.getNumberOfPeople();
        
        //END DEBUG #################################

        this.flightArr[l].depForCalculation=this.flightArr[l].outbound_dep_datetime
        this.flightArr[l].arrForCalculation=this.flightArr[l].outbound_arr_datetime
        this.flightArr[l].time=(new Date(this.flightArr[l].arrForCalculation).getTime() - new Date(this.flightArr[l].depForCalculation).getTime())/3600000;
        this.flightArr[l].depForCalculationdate = new Date(this.flightArr[l].depForCalculation);
        this.flightArr[l].arrForCalculationdate= new Date(this.flightArr[l].arrForCalculation);
        this.flightArr[l].flightDuration=this.toHours((new Date(this.flightArr[l].arrForCalculation).getTime() - new Date(this.flightArr[l].depForCalculation).getTime())/60000);
        this.flightArr[l].fulltime=this.flightArr[l].time + this.getExtraTimeNum(l, 2);
        this.flightArr[l].auslastung = this.carbonRatingHelper(1,this.flightArr[l].time) +this.carbonRatingHelper(0,this.getExtraTimeNum(l, 2)) ;
      }
      this.setMinMax();
      
    });

    this.http.get<HotelInterface[]>('http://search.mwtt.52.208.6.51.nip.io/hotel/search'+ '?'+ 'start_date=' + this.startDate + '&' +'duration='+ this.duration +'&' + this.destination + this.roomType + this.hotelBoardCode).subscribe(data => {
      this.hotelArr = data;

     
      for(let i=0;i<this.hotelArr.length;i++){
        this.http.get<Root>('http://content.mwtt.52.208.6.51.nip.io/desc/'+this.hotelArr[i].hotel_code).subscribe(hotelInfo =>{
          this.hotelArr[i].name=hotelInfo.success.name;
          this.hotelArr[i].desc=hotelInfo.success.text;
        });
        this.hotelArr[i].imgSource='http://content.mwtt.52.208.6.51.nip.io/img/'+this.hotelArr[i].hotel_code + '.jpeg';
        this.hotelArr[i].index=i;
        this.hotelArr[i].showImg=true;

      }
      this.hotelprice = this.hotelArr[0].price;
      
    });
    this.setMinMax();
  }

@ViewChild('nav', { read: DragScrollComponent, static: true }) ds: DragScrollComponent;
@ViewChild('nav2', { read: DragScrollComponent, static: true }) ds2: DragScrollComponent;


// setTrainArr(trainInt: TrainInterface[]){
//   this.trainArr = trainInt;
// }

//Scroll-bar
moveLeft1() {
  this.ds.moveLeft();
}
moveRight1() {
  this.ds.moveRight();
}

moveTo1(idx: number) {
  this.ds.moveTo(idx);
}
moveLeft2() {
  this.ds2.moveLeft();
}
moveRight2() {
  this.ds2.moveRight();
}

moveTo2(idx: number) {
  this.ds2.moveTo(idx);
}
getEndDest():string{
  return this.homePageData.endDest;
}

getStartDest():string{
  return this.homePageData.originDest;
}

getStartDate():string{
  return this.homePageData.startDate;
}

getEndDate():string{
  return this.homePageData.endDate;
}

getNumberOfPeople(): number{
  return this.homePageData.numberOfPeople;
}
//Index des ausgewaehlten Hotels
selectedindex = 0;
//Index der ausgewaehlten Reise
selectedindex1 = 0;
//Identifier on Selectierte Reise Zug oder Flug, 1=Zug 2=Flug
selectedidentifier = 1;
//Zum erkennen welche Daten fuer Vergleich-Pop-up man braucht
vergleichsIndex = 0;
hotelPopupIndex = 0;
travelprice = 0;
hotelprice = 0;

setHotelprice(price: number, index: number){
  if(index != this.selectedindex){
    this.hotelprice = price;
    this.selectedindex = index;
  }
  
}

getHotelBackground(index: number){
  let color ='rgba(33, 134, 138, 0.32)';
  if(index == this.selectedindex){
    color = 'rgba(33, 134, 138, 0.803)';
  }
  return color;
}
getTravelBackground(index: number){
  let color ='rgba(33, 134, 138, 0.7)';
  if(index == this.selectedindex1){
    color = 'rgba(33, 134, 138, 1)';
  }
  return color;
}
setTravelprice(price: number, index: number,identifier: number){
  if(index != this.selectedindex1 || identifier != this.selectedidentifier){
     this.travelprice = price;
     this.selectedindex1 = index;
     this.selectedidentifier = identifier;
    }
 }
 setTrainPrice(dep:number,back:number){
   if(dep == undefined){
     dep = back;
   }
   if(back == undefined){
     back=dep;
   }
   return Math.round(100*(dep+back))/100;
 }
 //Gibt an welcher Zug, Flug verglichen wird(zum Aufrufen der richtigen Daten notwendig)
 setVergleichIndex(Vergleichsindex: number){
   this.vergleichsIndex = Vergleichsindex;
 }
setHotelPopupIndex(index:number){
  this.hotelPopupIndex = index;
  
}
 changeMapImg(hotelindex:number){
      this.hotelArr[hotelindex].showImg= !this.hotelArr[hotelindex].showImg;
      
 }

editFav(index: number, indexArr: Array<number>){
    if(this.inFavorite(index, indexArr)){
      for(var i = 0; i < indexArr.length;i++){
        if(indexArr[i] == index){
          indexArr.splice(i, 1);
        }
      }
    }else{
      indexArr.push(index);
    }
   this.cardArr = this.cardArr1.concat(this.favArrTravel);
}
getFavoriteBackground(index: number, indexArr: Array<number>){
  let color ='white';
  if(this.inFavorite(index, indexArr)){
    color = 'gold';
  }
  return color;
  
}
inFavorite(index: number, indexArr: Array<number>){
  for(var i = 0; i < indexArr.length;i++){
    if(indexArr[i] == index){
      return true;
    }
  }
  return false;
}

getCheapest(){
  var x = this.trainArr[0].price + this.trainArrback[0].price + this.hotelArr[0].price;
  x = Math.round((x*100))/100;
  return x; 
}
getDiffrenz(){
  var x;
  if(this.travelprice + this.hotelprice >= this.getCheapest()){
    x = this.travelprice + this.hotelprice - this.getCheapest();
  }else{
    x = this.getCheapest() - (this.travelprice + this.hotelprice);
  }  
  x = Math.round((x*100))/100;
  return x;
}

//######### BEGIN FARBAMPEL FUNKTIONEN ##########
getPriceBackground(price: number){
  let scale = (this.colorRange)/(this.maxTravelPrice - this.minTravelPrice);
  let offset = -(this.minTravelPrice)*scale + 0;
  let colorIndex = price*scale + offset;
  return this.colors.get(Math.round(colorIndex).toString());
}



getTimeBackground(time: number){
  let scale = (this.colorRange)/(this.maxTravelDuration - this.minTravelDuration);
  let offset = -(this.minTravelDuration)*scale + 0;
  let colorIndex = time*scale + offset;
  //debug
  
  if(time < 4){
  }
  colorIndex = Math.abs(colorIndex);
  return this.colors.get(Math.round(colorIndex).toString());
}



getCarbonBackground(auslastung: number){
  
  let scale = (this.colorRange)/(this.maxCarbonEmission - this.minCarbonEmission);
  let offset = -(this.minTravelDuration)*scale + 0;
  let colorIndex = auslastung*scale + offset;
  colorIndex = Math.abs(colorIndex);
  return this.colors.get(Math.round(colorIndex-1).toString());
}
//########## END FARBAMPEL FUNKTIONEN #############

//Rating System fuer Ampelergaenzung
getPriceRating(price: number){
  let scale = (this.colorRange)/(this.maxTravelPrice - this.minTravelPrice);
  let offset = -(this.minTravelPrice)*scale + 0;
  let colorIndex = price*scale + offset;
  return +(8-colorIndex).toFixed(1);
}

getTimeRating(time: number){
  if(time == this.minTravelDuration){
    return 8;
  }
  let scale = (this.colorRange)/(this.maxTravelDuration - this.minTravelDuration);
  let offset = -(this.minTravelDuration)*scale + 0;
  let colorIndex = time*scale + offset;
  colorIndex = Math.abs(colorIndex);
  return +(8-colorIndex).toFixed(1);
}

getCarbonRating(time: number){ 
  let scale = (this.colorRange)/(this.maxCarbonEmission - this.minCarbonEmission);
  let offset = -(this.minCarbonEmission)*scale + 0;
  let colorIndex = time*scale + offset;
  colorIndex = Math.abs(colorIndex);
  return +(8-colorIndex).toFixed(1);

}

carbonRatingHelper(type:number, time:number){
  //berechnet fuer das jeweilige verkehrsmittel den CO2 Ausstoß
  let res = 0;
  //Zug
  if(type == 0){
    res = Math.round((time * 300 * 32)/1000);
    return res;
  }
  //Flug
  
  if(type == 1){
    res = Math.round((time * 700 * 380)/1000);
    return res;
  }
  return -1;
}


// HTML RUNDUNGSFUNKTION
//value: zu rundender Wert; index: anzahl der Nachkommastellen auf die gerundet werden soll
roundHTML(value: number, index: number){
   return value.toFixed(index);
}

getFlightStationName(station:String):string{
  if(station == 'AMS'){
    return 'Amsterdam Schipol';
  }
  if(station == 'CDG'){
    return 'Paris Charles de Gaulles';
  }
  if(station == 'CGN'){
    return 'Köln Bonn Airport';
  }
  if(station == 'DUS'){
    return  'Düsseldorf Int.';
  }
  if(station == 'FRA'){
    return 'Frankfurt Airport';
  }
  if(station == 'TXL'){
    return 'Berlin-Tegel';
  }
}
getDepArrtime(dateandtime:string):string{
  //1 = Zug 2 = Flug
  
   return dateandtime.substring(11,16);
}   
 
//Debug Methode
htmlDebug(){
  console.log("debug event triggered");
}



getTrainDest(station:number):string{
  if(station==8000001){
    return 'Aachen Hbf';
  }
  else if(station==8000085){
    return 'Düsseldorf Hbf';
  }
  else if(station==8000105){
    return 'Frankfurt(Main)Hbf';
  }
  else if(station==8000207){
    return 'Köln Hbf';
  }
  else if(station==8011160){
    return 'Berlin Hbf';
  }
  else if(station==8400058){
    return 'Amsterdam Centraal';
  }
  else if(station==8700011){
    return 'Paris Est';
  }
  else if(station==8700014 ){
    return 'Paris Nord';
  }
  else{
    return 'Invalid Station';
  }
}

setEndTrainCode(destination:string){
  if(destination.toUpperCase()=='AMSTERDAM'){
    this.trainDest=8400058;
  }
  else if(destination.toUpperCase()=='BERLIN'){
    this.trainDest=8011160;
  }
  else if(destination.toUpperCase()=='PARIS'){
    this.trainDest=8700011;
  }
  else if(destination.toUpperCase()=='DÜSSELDORF'){
    this.trainDest=8000085;
  }
  else if(destination.toUpperCase()=='AACHEN'){
    this.trainDest=8000001;
  }
  else if(destination.toUpperCase()=='FRANKFURT'){
    this.trainDest=8000105 ;
  }
  else if(destination.toUpperCase()=='KÖLN'){
    this.trainDest=8000207 ;
  }
}
setStartTrainCode(destination:string){
  if(destination.toUpperCase()=='AMSTERDAM'){
    this.trainStart=8400058;
  }
  else if(destination.toUpperCase()=='BERLIN'){
    this.trainStart=8011160;
  }
  else if(destination.toUpperCase()=='PARIS'){
    this.trainStart=8700011;
  }
  else if(destination.toUpperCase()=='DÜSSELDORF'){
    this.trainStart=8000085;
  }
  else if(destination.toUpperCase()=='AACHEN'){
    this.trainStart=8000001;
  }
  else if(destination.toUpperCase()=='FRANKFURT'){
    this.trainStart=8000105 ;
  }
  else if(destination.toUpperCase()=='KÖLN'){
    this.trainStart=8000207 ;
  }
}
toHours(num:number):string{
  var hours = Math.floor(num / 60);  
  var minutes = num % 60;
  if(hours<10 && minutes>=10){ 
    return '0' + hours + 'h' + minutes + 'min';  
  }
  else if(hours<10 && minutes<10){
    return '0' + hours + 'h' + '0' + minutes + 'min'; 
  }
  else if(hours>=10 && minutes<10){
    return hours + 'h' + '0' + minutes + 'min'; 
  }
  else{
    return hours + 'h' + minutes + 'min'; 
  }
}

w3_open() {
  document.getElementById("mySidebar").style.display = "block";
  document.getElementById("myOverlay").style.display = "block";
}

w3_close() {
  document.getElementById("mySidebar").style.display = "none";
  document.getElementById("myOverlay").style.display = "none";
}
setCardlength(){
  for(var i = 0; i < this.cardAnzahl; i++){
    this.cardArr1[i]=i;
  }
  this.cardArr = this.cardArr1.concat(this.favArrTravel);
}

onButtonClick(originDest:string,endDest:string,numberOfPeople:number,startDate:string,endDate:string,roomType:string,hotelBoardCode:string){
  //Zum ersten Element gehen nach einer Neuen Suche
  this.moveTo1(0);
  this.moveTo2(0);
  if(originDest=="" || endDest == "" || numberOfPeople == 0 || startDate.toString() == ""  || endDate.toString()==""){
    //alert('Bitte füllen Sie alle Felder aus');
  }
  else if(startDate.toString() == 'Invalid date' || endDate.toString() == 'Invalid date'){
  }
  else{
    this.setData(originDest,endDest,numberOfPeople,startDate,endDate, this.getRoomtype(roomType),this.getHotelBoardCode(hotelBoardCode));
    this.ngOnInit();
  }
}

getRoomtype(roomType:string):string{
  if(roomType!=''){
  return '&room_code='+roomType;
  }
  else{
    return '';
  }
}
getHotelBoardCode(hotelBoardCode:string):string{
  if(hotelBoardCode!=''){
    return '&board_code='+hotelBoardCode;
  }
  else{
    return '';
  }
}

setData(originDest: string,endDest:string,numberOfPeople:number,startDate:string,endDate:string, roomType:string,boardCode:string){
  this.homePageData.originDest = originDest;
  this.homePageData.endDest = endDest;
  this.homePageData.numberOfPeople=numberOfPeople;
  this.homePageData.startDate=startDate;
  this.homePageData.endDate=endDate;
  this.roomType=roomType;
  this.hotelBoardCode=boardCode;
}
decodeBoardCode(boardCode:string){
  if(boardCode =="HP"){
    return "Halbpension";
  }
  if(boardCode =="OV"){
    return "Ohne Verpflegung";
  }
  if(boardCode =="VP"){
    return "Vollpension";
  }
  if(boardCode =="AI"){
    return "All Inclusive";
  }
  if(boardCode =="FR"){
    return "Frühstück";
  }
}
decodeRoomtype(roomCode:string){
  if(roomCode == "DZ"){
    return "Doppelzimmer";
  }
  if(roomCode == "AP"){
    return "Apartment";
  }
  if(roomCode == "SU"){
    return "Suite";
  }
}
getPaketflight(travelArr:FlightInterface[]){
  var tmpflighttime = travelArr[0].fulltime;
  var tmpflighttimeIndex = 0;
  var tmprating = 0;
  var tmpratingIndex = 0;
  var tmpflightauslastung = travelArr[2].auslastung;
  var tmpflightauslastungIndex = 0;
  for(var i = 0; i < travelArr.length; i++){
   
      if(travelArr[i].fulltime < tmpflighttime){
        tmpflighttime = travelArr[i].fulltime;
        tmpflighttimeIndex = i;
    }
      if(travelArr[i].auslastung < tmpflightauslastung){
        tmpflightauslastung = travelArr[i].auslastung;
        tmpflightauslastungIndex = i;
    }
      if(this.getCarbonRating(travelArr[i].auslastung)+this.getTimeRating(travelArr[i].fulltime)+this.getPriceRating(travelArr[i].price)> tmprating){
        tmprating = this.getCarbonRating(travelArr[i].auslastung)+this.getTimeRating(travelArr[i].fulltime)+this.getPriceRating(travelArr[i].price);
        tmpratingIndex = i;
      }
  }

  var tmp; 
  var tmp1 = travelArr[tmpflighttimeIndex];
  var tmp2 = travelArr[tmpflightauslastungIndex];
  if(tmpflighttimeIndex == 0){
    travelArr[1] = tmp1;
  }else{
    tmp = travelArr[1];
    travelArr[1] = travelArr[tmpflighttimeIndex];
    travelArr[tmpflighttimeIndex] = tmp;
  }
  if(tmpflightauslastungIndex < 2){
    travelArr[2] = tmp2;
  }else{
    tmp = travelArr[2];
    travelArr[2] = travelArr[tmpflightauslastungIndex];
    travelArr[tmpflightauslastungIndex] =tmp;
  }
  travelArr[3] = travelArr[tmpratingIndex];
  return travelArr;
}
getPakettrain(travelArr:TrainInterface[]){
  var tmptrainprice = travelArr[0].price;
  var tmptrainpriceIndex = 0;
  var tmprating = 0;
  var tmpratingIndex = 0;
  var tmptraintime = travelArr[0].fulltime;
  var tmptraintimeIndex = 0;
  var tmptrainauslastung = travelArr[0].auslastung;
  var tmptrainauslastungIndex = 0;
  for(var i = 0; i < travelArr.length; i++){
    if(travelArr[i] != undefined){
      if(travelArr[i].price < tmptrainprice){
        tmptrainprice = travelArr[i].price;
        tmptrainpriceIndex = i;
      }
      if(travelArr[i].fulltime < tmptraintime){
        tmptraintime = travelArr[i].fulltime;
        tmptraintimeIndex = i;
      }
      if(travelArr[i].auslastung < tmptrainauslastung){
        tmptrainauslastung = travelArr[i].auslastung;
        tmptrainauslastungIndex = i;
      }
      if((this.getCarbonRating(travelArr[i].auslastung)+this.getTimeRating(travelArr[i].fulltime)+this.getPriceRating(travelArr[i].price))-travelArr[i].changes> tmprating){
        tmprating = this.getCarbonRating(travelArr[i].auslastung)+this.getTimeRating(travelArr[i].fulltime)+this.getPriceRating(travelArr[i].price);
        tmpratingIndex = i;
      }
    }
  }
  var tmp =  travelArr[0];
  travelArr[0] = travelArr[tmptrainpriceIndex];
  if(tmptrainpriceIndex>0){
    travelArr[tmptrainpriceIndex] = tmp;
  }
  tmp = travelArr[1];
  travelArr[1] =travelArr[tmptraintimeIndex];
  if(tmptraintimeIndex>1){
    travelArr[tmptraintimeIndex] = tmp;
  }
  tmp = travelArr[2];
  travelArr[2] =travelArr[tmptrainauslastungIndex];
  if(tmptrainauslastungIndex>2){
    travelArr[tmptrainauslastungIndex] = tmp;
  }
  tmp = travelArr[3];
  travelArr[3]= travelArr[tmpratingIndex];
  if(tmpratingIndex>3){
    travelArr[tmpratingIndex] = tmp;
  }
  return travelArr;
}
setMinMax(){
  this.trainArr=this.getPakettrain(this.trainArr);
  this.trainArrback=this.getPakettrain(this.trainArrback);
  this.flightArr=this.getPaketflight(this.flightArr);
  this.cardAnzahl = Math.min(this.trainArrback.length,this.trainArr.length,this.flightArr.length,51);
  this.setCardlength();
  this.minCarbonEmission = this.trainArr[0].auslastung;
  this.minTravelDuration = this.flightArr[1].fulltime;
  this.travelprice = this.trainArr[0].price + this.trainArrback[0].price;
  this.minTravelPrice = this.trainArr[0].price + this.trainArrback[0].price;
  this.setMax();
}
setMax(){
  for(var i = 0;i < this.cardAnzahl;i++){
    if(this.minCarbonEmission > this.trainArr[i].auslastung){
    this.minCarbonEmission =this.trainArr[i].auslastung;
    }
    if(this.minCarbonEmission > this.flightArr[i].auslastung){
    this.minCarbonEmission = this.flightArr[i].auslastung;
    } 
    if(this.maxCarbonEmission < this.trainArr[i].auslastung){
    this.maxCarbonEmission =this.trainArr[i].auslastung;
    }
    if(this.maxCarbonEmission < this.flightArr[i].auslastung){
    this.maxCarbonEmission = this.flightArr[i].auslastung;
    }
    if(this.maxTravelDuration < this.trainArr[i].fulltime){
    this.maxTravelDuration =this.trainArr[i].fulltime;
    }
    if(this.maxTravelDuration < this.flightArr[i].fulltime){
    this.maxTravelDuration = this.flightArr[i].fulltime;
    }
    if(this.maxTravelPrice < (this.trainArr[i].price+this.trainArrback[i].price)){
    this.maxTravelPrice =(this.trainArr[i].price+this.trainArrback[i].price);
    }
    if(this.maxTravelPrice < this.flightArr[i].price){
    this.maxTravelPrice = this.flightArr[i].price;
    }  
  }   
}
getExtraTime(travelIndex:number, travelArt:number):string{
  //Zugback
  if(travelArt == 0){
    if(this.trainArr[travelIndex].startDestination == "Aachen Hbf"){
      return "0min"
    }
    if(this.trainArrback[travelIndex].endDestination == "Köln Hbf"){
      return "40min"
    }
    if(this.trainArrback[travelIndex].endDestination == "Düsseldorf Hbf"){
      return "1h10min"
    }
    if(this.trainArrback[travelIndex].endDestination == "Frankfurt(Main)Hbf"){
      return "1h50min"
    }
  }
  
  //Zug
    if(travelArt == 1){
      if(this.trainArr[travelIndex].startDestination == "Aachen Hbf"){
        return "0min"
      }
      if(this.trainArr[travelIndex].startDestination == "Köln Hbf"){
        return "40min"
      }
      if(this.trainArr[travelIndex].startDestination == "Düsseldorf Hbf"){
        return "1h10min"
      }
      if(this.trainArr[travelIndex].startDestination == "Frankfurt(Main)Hbf"){
        return "1h50min"
      }
    }
  //Flug
  if(travelArt == 2){
    if(this.flightArr[travelIndex].outbound_dep_airport == "CGN"){
      return "40min"
    }
    if(this.flightArr[travelIndex].outbound_dep_airport == "DUS"){
      return "1h10min"
    }
    if(this.flightArr[travelIndex].outbound_dep_airport == "FRA"){
      return "1h50min"
    }
  }
  
  return''
}
getExtraTimeNum(travelIndex:number, travelArt:number):number{
  //Zugback
  if(travelArt == 0){
    if(this.trainArrback[travelIndex].endDestination == "Köln Hbf"){
      return 0.66
    }
    if(this.trainArrback[travelIndex].endDestination == "Düsseldorf Hbf"){
      return 1.16
    }
    if(this.trainArrback[travelIndex].endDestination == "Frankfurt(Main)Hbf"){
      return 1.84
    }
  }
  
  //Zug
    if(travelArt == 1){
      if(this.trainArr[travelIndex].startDestination == "Köln Hbf"){
        return 0.66
      }
      if(this.trainArr[travelIndex].startDestination == "Düsseldorf Hbf"){
        return 1.16
      }
      if(this.trainArr[travelIndex].startDestination == "Frankfurt(Main)Hbf"){
        return 1.84
      }
    }
  //Flug
  if(travelArt == 2){
    if(this.flightArr[travelIndex].outbound_dep_airport == "CGN"){
      return 0.66
    }
    if(this.flightArr[travelIndex].outbound_dep_airport == "DUS"){
      return 1.16
    }
    if(this.flightArr[travelIndex].outbound_dep_airport == "FRA"){
      return 1.84
    }
  }
  
  return 0;
}
sortPriceflight(travelArr:FlightInterface[]){
  if(travelArr != undefined){
    for(var i = 4; i < travelArr.length;i++){
      var x = i-1
      var key = travelArr[i];
      while(x>3 && travelArr[x].price > key.price){
        travelArr[x+1] = travelArr[x];
        x--;
      }
      travelArr[x+1] = key;
    }
    return travelArr;
  }
}
sortTimeflight(travelArr:FlightInterface[]){
  if(travelArr != undefined){
    for(var i = 4; i < travelArr.length;i++){
      var x = i-1
      var key = travelArr[i];
      while(x>3 && travelArr[x].fulltime > key.fulltime){
        travelArr[x+1] = travelArr[x];
        x--;
      }
      travelArr[x+1] = key;
    }
    return travelArr;
  }
}
sortAuslastungflight(travelArr:FlightInterface[]){
  if(travelArr != undefined){
    for(var i = 4; i < travelArr.length;i++){
      var x = i-1
      var key = travelArr[i];
      while(x>3 && travelArr[x].auslastung > key.auslastung){
        travelArr[x+1] = travelArr[x];
        x--;
      }
      travelArr[x+1] = key;
    }
    return travelArr;
  }
}
sortPricetrain(travelArr:TrainInterface[]){
  if(travelArr != undefined){
    for(var i = 4; i < travelArr.length;i++){
      var x = i-1
      var key = travelArr[i];
      while(x>3 && travelArr[x].price > key.price){
        travelArr[x+1] = travelArr[x];
        x--;
      }
      travelArr[x+1] = key;
    }
    return travelArr;
  }
}
sortTimetrain(travelArr:TrainInterface[]){
  if(travelArr != undefined){
    for(var i = 4; i < travelArr.length;i++){
      var x = i-1
      var key = travelArr[i];
      while(x>3 && travelArr[x].fulltime > key.fulltime){
        travelArr[x+1] = travelArr[x];
        x--;
      }
      travelArr[x+1] = key;
    }
    return travelArr;
  }
}
sortAuslastungtrain(travelArr:TrainInterface[]){
  if(travelArr != undefined){
    for(var i = 4; i < travelArr.length;i++){
      var x = i-1
      var key = travelArr[i];
      while(x>3 && travelArr[x].auslastung > key.auslastung){
        travelArr[x+1] = travelArr[x];
        x--;
      }
      travelArr[x+1] = key;
    }
    return travelArr;
  }
}
sortChangestrain(travelArr:TrainInterface[]){
  if(travelArr != undefined){
    for(var i = 4; i < travelArr.length;i++){
      var x = i-1
      var key = travelArr[i];
      while(x>3 && travelArr[x].changes > key.changes){
        travelArr[x+1] = travelArr[x];
        x--;
      }
      travelArr[x+1] = key;
    }
    return travelArr;
  }
}
toSort(Sortindex:number){
  if(this.whattoSort[Sortindex]==false){
    this.whattoSort=[false,false,false];
    this.whattoSort[Sortindex] = true;
    if(Sortindex == 0){
      this.sortPriceflight(this.flightArr);
      this.sortPricetrain(this.trainArr);
      this.sortPricetrain(this.trainArrback);
    }
    if(Sortindex == 1){
      this.sortTimeflight(this.flightArr);
      this.sortTimetrain(this.trainArr);
      this.sortTimetrain(this.trainArrback);
    }
    if(Sortindex == 2){
      this.sortAuslastungflight(this.flightArr);
      this.sortChangestrain(this.trainArr);
      this.sortAuslastungtrain(this.trainArrback);
    }
  }
  this.setMax();
}
getExtras(x:number,extra:number, y:number){
    if(y == 1){
      if(((x * 17)%28) > 14 && extra ==1){
        return "Essen";
      }
      if(((x * 21)%13) < 7&& extra ==2){
        return "Wi-Fi";
      }
      if(((x*31)%41) > 20 && extra ==3){
      return "Abteil";
      }
  }
  if(y == 2){
    if(((x * 29)%28) < 14 && extra ==1){
      return "Essen";
    }
    if(((x * 39)%13) < 7 && extra ==2){
      return "Wi-Fi";
    }
    if(((x*51)%41) < 20 && extra ==3){
     return "Beinfreiheit+";
    }
  }
  return "";  
}
getPaketname(index:number){
  if(index == 0){
    return "Sparfuchs";
  }
  if(index == 1){
    return "Speedy";
  }
  if(index == 2){
    return "Ökosieger";
  }
  if(index == 3){
    return "Coyote";
  }
  return "Angebot "+index;
}
  cardArr=[];
  cardArr1=[];
  favArrHotel=[];
  favArrTravel=[0,1,2,3];
  
}

