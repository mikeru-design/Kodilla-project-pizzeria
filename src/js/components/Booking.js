import { select, templates, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){

    this.render(element);
    this.initWidgets();
    this.getData();
  }

  render(bookingWidget){

    this.dom = {};
    this.dom.bookingWidget = bookingWidget;

    const generatedHTML = templates.bookingWidget();
    const element = utils.createDOMFromHTML(generatedHTML);
    this.dom.bookingWidget.appendChild(element);

    this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    this.dom.timePicker = document.querySelector(select.widgets.hourPicker.wrapper);
  }

  getData(){

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ]
    };
    console.log('getData params', params);

    const urls = {
      bookings:         settings.db.url + '/' + settings.db.bookings
                                        + '?' + params.bookings.join('&'),
      eventsCurrent:    settings.db.url + '/' + settings.db.events
                                        + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:     settings.db.url + '/' + settings.db.events
                                        + '?' + params.eventsRepeat.join('&'),
    };
    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function(allResponses){
        const bookingsResponse      = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse  = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);

        this.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    this.booked = {};

    for ( let item of eventsCurrent ){
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    console.log('this.booked: ', this.booked);
    console.log(bookings);
    console.log(eventsCurrent);
    console.log(eventsRepeat);
  }

  makeBooked(date, hour, duration, table){

    if ( typeof this.booked[date] == 'undefined'){
      this.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    if ( typeof this.booked[date][startHour] == 'undefined'){
      this.booked[date][startHour] = [];
    }

    this.booked[date][startHour].push(table);

    for ( let index = 0; index < 3; index++){
      console.log('loop', index)
    }
  }

  initWidgets(){

    this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);

    this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);

    this.datePicker = new DatePicker(this.dom.datePicker);

    this.timePicker = new HourPicker(this.dom.timePicker);

  }
}

export default Booking;