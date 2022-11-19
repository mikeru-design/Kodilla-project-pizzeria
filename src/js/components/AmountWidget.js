import { settings, select } from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;

    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);

    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);

    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = settings.amountWidget.defaultValue;

    const newValue = parseInt(value);

    if (thisWidget.value !== newValue && !isNaN(newValue) && settings.amountWidget.defaultMax >= newValue && newValue >= settings.amountWidget.defaultMin){
      thisWidget.value = newValue;
    } else if (newValue > settings.amountWidget.defaultMax){
      thisWidget.value = settings.amountWidget.defaultMax;
    } else if (newValue < settings.amountWidget.defaultMin){
      thisWidget.value = settings.amountWidget.defaultMin;
    }

    thisWidget.input.value = thisWidget.value;

    thisWidget.announce();
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', () => {
      thisWidget.setValue();
    });
    thisWidget.linkDecrease.addEventListener('click', (event) => {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', (event) => {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;