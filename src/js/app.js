
import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {

  initData(){
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then( function(rawResponse){
        console.log('rawResponse', rawResponse);
        return rawResponse.json();
      })
      .then( function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initMenu(){

    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', (event) => {
      app.cart.add(event.detail.product);
    });
  },

  init(){
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();