import { select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){

    this.render(element);
    this.initWidgets();
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

  initWidgets(){

    this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    // this.dom.peopleAmount.addEventListener('update', () => {});

    this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
    // this.dom.hoursAmount.addEventListener('update', () => {});

    this.datePicker = new DatePicker(this.dom.datePicker);
    // this.dom.datePicker.addEventListener('update', () => {});

    this.timePicker = new HourPicker(this.dom.timePicker);
    // this.dom.timePicker.addEventListener('update', () => {});

  }
}

export default Booking;