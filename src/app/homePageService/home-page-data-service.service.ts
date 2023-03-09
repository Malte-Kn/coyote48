import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomePageDataServiceService {
  originDest:string;
  endDest:string;
  numberOfPeople:number;
  startDate:string;
  endDate:string;
  constructor() { }
}
