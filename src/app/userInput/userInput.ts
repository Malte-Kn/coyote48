export class userInput {

    
    //Startseite input
    targetDest: string;
    originDest: string;
    persCount: number;
    startDate: Date;
    finishDate: Date;

    //optionale seite input
    //checkHotel: boolean;
    //checkTrain: boolean;
    //checkFlight: boolean;
    //checkBaggage: boolean;
    //checkRoom: RoomTypes;
    //checkMaxPrice: number;
    //checkDesiredHotel: string; //HOTEL ID
    //checkTrainClass: TrainClass;

    constructor(targetDest: string,originDest: string,persCount: number,startDate: Date,finishDate: Date){
        this.targetDest= targetDest;
        this.originDest = originDest;
        this.persCount = persCount;
        this.startDate=startDate;
        this.finishDate=finishDate;
    }

}

enum RoomTypes {
    Single = 1,
    Double = 2
}

enum TrainClass {
    First = 1,
    Second = 2
}