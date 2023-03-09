import { Component, OnInit } from '@angular/core';
import { HomePageDataServiceService } from '../homePageService/home-page-data-service.service'


@Component({
  selector: 'app-bottom-slider',
  templateUrl: './bottom-slider.component.html',
  styleUrls: ['./bottom-slider.component.css']
})
export class BottomSliderComponent implements OnInit {
  
  constructor(private destSetter:HomePageDataServiceService) { }

  setDest(endDest: string){
    this.destSetter.endDest = endDest;
  }

  ngOnInit(): void {
  }

}
