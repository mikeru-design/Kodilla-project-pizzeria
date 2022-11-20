import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{

  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = document.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);

    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);

    thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', () => {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', () => {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', (event) => {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', (event) => {
      event.preventDefault();

      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;

    console.log('adding product', menuProduct);

    const generatedHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();
  }

  update(){
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {

      thisCart.totalNumber += product.amount;

      thisCart.subtotalPrice += product.price;
    }

    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    thisCart.totalPrice = 0;

    if (thisCart.subtotalPrice !== 0){

      for (let totalPrice of thisCart.dom.totalPrice){

        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
        totalPrice.innerHTML = thisCart.totalPrice;
      }
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

    } else if (thisCart.subtotalPrice == 0){

      for (let totalPrice of thisCart.dom.totalPrice){
        totalPrice.innerHTML = 0;
      }
      thisCart.dom.deliveryFee.innerHTML = 0;
    }
  }

  remove(thisCartProduct){
    const thisCart = this;

    thisCartProduct.dom.wrapper.remove();

    const indexOfThisCartProduct = thisCart.products.indexOf(thisCartProduct);

    thisCart.products.splice(indexOfThisCartProduct, 1);

    thisCart.update();

  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products:[],
    };

    for(let product of thisCart.products) {
      payload.products.push(product.getData());
    }


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
      });
  }
}

export default Cart;
