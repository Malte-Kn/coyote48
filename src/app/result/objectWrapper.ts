// This File was created to handle the data from the search service in objects

//Hotel Wrapper
export interface HotelInterface {
    destination: string;
    start_date: Date;
    duration: number;
    hotel_code: string;
    room_code: string;
    board_code: string;
    price: number;
    imgSource:string;
    index:number;
    showImg: boolean;

    name:string;
    desc:string;
  }

//Flight Wrapper
  export interface FlightInterface {
    date: string;
    outbound_flight_no: string;
    outbound_dep_airport: string;
    outbound_dep_datetime: string;
    outbound_arr_airport: string;
    outbound_arr_datetime: string;
    inbound_flight_no: string;
    inbound_dep_airport: string;
    inbound_dep_datetime: string;
    inbound_arr_airport: string;
    inbound_arr_datetime: string;
    duration: number;
    price: number;

    depForCalculationdate:Date;
    depForCalculation:string;
    arrForCalculationdate:Date;
    arrForCalculation:string;
    time:number; // fuer Ampelsystem
    flightDuration: string;
    fulltime:number;//time + Anfahrtszeit
    auslastung:number;
    index:number;
  }
//Train Wrapper
  export interface TrainInterface {
    date: string;
    class: number;
    departure: number;
    arrival: number;
    dep_date_time: string;
    arr_date_time: string;
    train_types: string;
    changes: number;
    fare: string;
    binding: boolean;
    chancelable: boolean;
    price: number;

    time:number; // fuer Ampelsystem
    fulltime:number;//time + Anfahrtszeit
    depForCalculation:string;
    arrForCalculation:string;
    duration:string;
    index:number;
    endDestination:string;
    startDestination:string;
    auslastung:number;
    depTime:string;
    arrTime:string;
  }

  export interface Root {
    success: Success;
  }
  
  export interface Success {
    name: string;
    text: string;
  }
  