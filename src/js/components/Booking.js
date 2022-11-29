import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import PeopleWidget from './peopleWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.tablesClicked = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initAction();
  }

  render(wrapper){
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrapper;

    const generatedHTML = templates.bookingWidget();
    const element = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper.appendChild(element);

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.timePicker = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.floor = document.querySelector(select.booking.floor);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.sendResBtn = document.querySelector(select.booking.sendResBtn);
    thisBooking.dom.phone = document.querySelector(select.booking.phoneInput);
    thisBooking.dom.address = document.querySelector(select.booking.addressInput);
    thisBooking.dom.startersCheck = document.querySelectorAll(select.booking.startersCheck);
    thisBooking.dom.orderConfirmationInputs = document.querySelectorAll('.order-confirmation input');
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new PeopleWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.timePicker = new HourPicker(thisBooking.dom.timePicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

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
      bookings:      settings.db.url + '/' + settings.db.bookings
                                     + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events
                                     + '?' + params.eventsRepeat.join('&'),
    };
    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then((allResponses) => {
        const bookingsResponse      = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse  = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for ( let item of bookings ){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for ( let item of eventsCurrent ){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for ( let item of eventsRepeat ){
      if( item.repeat == 'daily'){
        for ( let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    console.log('thisBooking.booked: ', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if ( typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for ( let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){

      if ( typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  tableReservation(event){
    const thisBooking = this;

    for ( let table of thisBooking.dom.tables){

      if(table.classList.contains(classNames.booking.tableBooked)){
        table.classList.remove(classNames.booking.tableClicked);
      }
    }

    if ( event.target.classList.contains('table')){

      const tableNm = event.target.getAttribute('data-table');

      if( !event.target.classList.contains(classNames.booking.tableClicked) && !event.target.classList.contains('booked') ){

        event.target.classList.add(classNames.booking.tableClicked);

        thisBooking.tablesClicked.push(tableNm);
        console.log('tablesClicked: ',thisBooking.tablesClicked);

        for ( let table of thisBooking.dom.tables ){
          table.classList.remove('alert');
        }

      } else if ( event.target.classList.contains(classNames.booking.tableClicked) ){

        event.target.classList.remove(classNames.booking.tableClicked);

        const tableIndex = thisBooking.tablesClicked.indexOf(tableNm);
        console.log(tableIndex);
        thisBooking.tablesClicked.splice(tableIndex, 1);
        console.log('tablesClicked: ',thisBooking.tablesClicked);
      } else {
        window.alert('This table is not available at this time!');
      }
    }
  }

  tableAvailable(){
    const thisBooking = this;

    const strHour = utils.hourToNumber(thisBooking.timePicker.value);
    const strDate = thisBooking.datePicker.value;
    const duration = thisBooking.hoursAmountWidget.value;

    for ( let tableNm of thisBooking.tablesClicked){

      if ( thisBooking.booked[strDate] ){

        for ( let hourBlock = strHour; hourBlock < strHour + duration; hourBlock+= 0.5 ){

          const bookedTables = thisBooking.booked[strDate][hourBlock];

          if(  bookedTables && bookedTables.includes(parseInt(tableNm)) ){

            let hourBlockToText = '';

            const hourBlockToTextF = function(hourBlock){
              if ( hourBlock.toString().includes('5', 3) ){
                hourBlockToText = hourBlock.toString().replace('.5', ':30');
              } else {
                hourBlockToText = hourBlock.toString() + ':00';
              }

              return hourBlockToText;
            };

            window.alert(`Sorry, you can't reserve table ${tableNm} for ${duration} hours.\nIt's already reserved from ${hourBlockToTextF(hourBlock)}`);

            return false;
          }
        }
      }
    }
    return true;
  }

  formCheck(){
    const thisBooking = this;

    if( thisBooking.tablesClicked.length !== 0 && thisBooking.dom.phone.value && thisBooking.dom.address.value){
      return true;
    } else {
      window.alert(`Please fill out all required fields`);

      for ( let table of thisBooking.dom.tables){
        if ( thisBooking.tablesClicked.length == 0){
          table.classList.add('alert');
        }
      }

      for ( let input of thisBooking.dom.orderConfirmationInputs){
        input.classList.add('alert');
      }
      return false;
    }
  }

  initAction(){
    const thisBooking = this;

    thisBooking.dom.floor.addEventListener('click', (event) => {
      thisBooking.tableReservation(event);
    });

    thisBooking.dom.sendResBtn.addEventListener('click', (event) => {
      event.preventDefault();

      if ( thisBooking.tableAvailable() && thisBooking.formCheck() ) {
        thisBooking.sendBooking();
      }
    });

    for ( let input of thisBooking.dom.orderConfirmationInputs){
      input.addEventListener('change', function() {
        this.classList.remove('alert');
      });
    }


  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.timePicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for ( let table of thisBooking.dom.tables){

      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);

      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

      if( table.classList.contains(classNames.booking.tableBooked)){

        table.classList.remove(classNames.booking.tableClicked);

        const tableNm = table.getAttribute('data-table');

        if( thisBooking.tablesClicked.includes(tableNm)){

          const tableIndex = thisBooking.tablesClicked.indexOf(tableNm);

          thisBooking.tablesClicked.splice(tableIndex, 1);
          console.log('tableBooked: ',thisBooking.tablesClicked);
        }
      }
    }
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {

      date: thisBooking.datePicker.value,
      hour: thisBooking.timePicker.value,
      table: Number( thisBooking.tablesClicked.toString() ),
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value

    };

    for( let input of thisBooking.dom.startersCheck){
      if( input.checked ){
        payload.starters.push(input.value);
      }
    }
    console.log('payload: ',payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then((response) => {
        return response.json();
      }).then((parsedResponse) => {
        console.log('parsedResponse', parsedResponse);

        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.updateDOM();
      });

    for ( let input of thisBooking.dom.orderConfirmationInputs){
      input.classList.remove('alert');
      thisBooking.dom.address.value = '';
      thisBooking.dom.phone.value = '';
    }

    for ( let table of thisBooking.dom.tables){
      table.classList.remove('alert');
    }

    console.log(payload.table);
  }
}


export default Booking;