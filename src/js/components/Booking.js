import { settings, select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){

    this.render(element);
    this.initWidgets();
  }

  render(bookingWidget){

    this.dom = {};
    this.dom.bookingWidget = bookingWidget;

    const generatedHTML = templates.bookingWidget();
    this.elem = utils.createDOMFromHTML(generatedHTML);

    // this.dom.bookingContainer = document.querySelector(select.containerOf.booking);
    this.dom.bookingWidget.appendChild(this.elem);

    this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){

    this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.dom.peopleAmount.addEventListener('update', () => {
    });

    this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
    this.dom.hoursAmount.addEventListener('update', () => {
    });

  }

}
export default Booking;