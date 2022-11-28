import { settings } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class PeopleWidget extends AmountWidget{

  constructor(element){
    super(element, settings.amountWidget.defaultValue);
  }

  isValid(value){
    return !isNaN(value)
    && value <= settings.booking.peopleWidget.defaultMax
    && value >= settings.booking.peopleWidget.defaultMin;
  }
}

export default PeopleWidget;