
import { settings, select,  classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {

  initData(){
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then( function(rawResponse){
        // console.log('rawResponse', rawResponse);
        return rawResponse.json();
      })
      .then( function(parsedResponse){
        // console.log('parsedResponse', parsedResponse);

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });

    // console.log('thisApp.data', JSON.stringify(thisApp.data));
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

  initBooking(){
    const thisApp = this;

    const bookingWidget = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingWidget);
  },

  initPages(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.actionBlocks = document.querySelector(select.containerOf.actionBlocks);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = false;

    for ( let page of thisApp.pages) {

      if ( page.id == idFromHash){
        thisApp.activatePage(idFromHash);
        pageMatchingHash = true;
        break;
      }

      if (!pageMatchingHash){
        thisApp.activatePage( thisApp.pages[0].id);
      }
    }

    for ( let link of thisApp.navLinks){

      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = '#/' + id;
      });
    }

    thisApp.actionBlocks.addEventListener('click', (event) => {
      event.preventDefault();

      if ( event.target.localName == 'a' || event.target.parentElement.localName == 'a' ){
        console.log(event);
        let eventId = '';

        if ( event.target.localName == 'a' ){
          eventId = event.target.getAttribute('href').replace('#', '');
        }

        if ( event.target.parentElement.localName == 'a' ){
          eventId = event.target.parentElement.getAttribute('href').replace('#', '');
        }

        thisApp.activatePage(eventId);
      }
    });

  },

  activatePage(pageId){
    const thisApp = this;

    // add class active to matching page and remove from the non-matching
    for ( let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    // add class active to matching link and remove from the non-matching
    for ( let link of thisApp.navLinks){
      const linkIdFromHref = link.getAttribute('href').replace('#', '');
      link.classList.toggle(classNames.nav.active, linkIdFromHref == pageId);
    }

  },

  initCarousel(){
    const thisApp = this;

    const carouselElem = document.querySelector('.main-carousel');

    // eslint-disable-next-line no-undef
    thisApp.carouselElem = new Flickity( carouselElem, {
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      autoPlay: true,
      prevNextButtons: false,
      // pageDots: false,

    });

  },

  init(){
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initCarousel();
  },
};

app.init();