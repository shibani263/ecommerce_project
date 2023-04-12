import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { cart, order } from '../data-type';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  totalPrice: number | undefined;
  cartData: cart[] | undefined;
  orderMsg: string | undefined;


// Payment gateway //

  buttonColor = "black";
  buttonType = "buy";
  isCustomSize = false;
  buttonWidth = 240;
  buttonHeight = 40;
  isTop = window === window.top;

  paymentRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedPaymentMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["AMEX", "VISA", "MASTERCARD"]
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "example",
            gatewayMerchantId: "exampleGatewayMerchantId"
          }
        }
      }
    ],
    merchantInfo: {
      merchantId: "12345678901234567890",
      merchantName: "Demo Merchant"
    },
    transactionInfo: {
      totalPriceStatus: "FINAL",
      totalPriceLabel: "Total",
      totalPrice: "100.00",
      currencyCode: "USD",
      countryCode: "US"
    }
  };

  

// end of payment gateway //

  constructor(private product: ProductService, private router: Router) { }
  ngOnInit(): void {
    this.product.currentCart().subscribe((result) => {

      let price = 0;
      this.cartData = result;
      result.forEach((item) => {
        if (item.quantity) {
          price = price + (+item.price * +item.quantity);
        }
      });
      this.totalPrice = price + (price / 10) + 100 - (price / 10);
      console.warn(this.totalPrice);

    });
  }
  orderNow(data: { email: string, address: string, mobile: string }) {
    let user = localStorage.getItem('user');
    let userId = user && JSON.parse(user).id;

    if (this.totalPrice) {
      let orderData: order = {
        ...data,
        totalPrice: this.totalPrice,
        userId,
        id: undefined
      }

      this.cartData?.forEach((item) => {
        setTimeout(() => {
          item.id && this.product.deleteCartItems(item.id)
        }, 600);
      })
      this.product.orderNow(orderData).subscribe((result) => {
        if (result) {
this.orderMsg = "Your order has been placed";

          setTimeout(() => {
            this.router.navigate(['/my-orders']);
            this.orderMsg = undefined;
          },4000)
        }
      })
    }


  }
  onLoadPaymentData(event:any) {
    console.log("load payment data", event.detail);
  }

}
