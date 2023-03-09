import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomePageDataServiceService } from '../homePageService/home-page-data-service.service'

@Component({
  selector: 'app-optional',
  templateUrl: './optional.component.html',
  styleUrls: ['./optional.component.css']
})
export class OptionalComponent implements OnInit {

  constructor(private router: Router, private homePageData: HomePageDataServiceService) { }

  flightChecked: boolean = true;
  trainChecked: boolean = true;
  baggageChecked: boolean = false;

  onButtonClick(): void{
    if(this.flightChecked || this.trainChecked){
      this.router.navigate(['/result']);
    }
    else{
      alert('Fehler');
    }
  }

  onCheckboxClick(checked:number): void{
    
    //verändert die 
    if(checked == 1){
      this.flightChecked = !this.flightChecked;
      console.log(this.trainChecked);
    }
    if(checked == 2){
      this.trainChecked = !this.trainChecked;
      console.log(this.trainChecked);
    }
    if(checked == 3){
      this.baggageChecked = !this.baggageChecked;
    }
  }

  ngOnInit(): void {
    
  }

  openDropDownMenu(){
    let dropdownBtn = <HTMLElement>document.querySelector('.menu-btn');
    let menuContent =  <HTMLElement>document.querySelector('.menu-content');
    if(menuContent.style.display==""){
      menuContent.style.display="block";
    } else {
      menuContent.style.display="";
    }
  }
  
  getEndDest():string{
    return this.homePageData.endDest;
  }
  
  getStartDest():string{
    return this.homePageData.endDest;
  }
  

  getNumberOfPeople(): number{
    return this.homePageData.numberOfPeople;
  }
  
 
}
