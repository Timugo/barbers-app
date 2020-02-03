import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Barber } from '../interfaces/barber';
import { NavigationExtras } from '@angular/router';
import { DataLocalService } from './data-local.service';
import { Plugins } from '@capacitor/core';
import { AlertController } from '@ionic/angular';


const { Storage } = Plugins;
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};
const URL = environment.url;
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  mensaje: any;
  token :string = null;
  barber: Barber;

  constructor( private http: HttpClient,private datalocalService: DataLocalService,public alertController: AlertController,) { }

  
  postBarber(telefono: number) {

    return new Promise(resolve=>{
      this.http.post(URL + '/loginBarber', {phone: telefono}, httpOptions).subscribe( res => {
        this.mensaje = res;
        if (this.mensaje.response === 1) {
          //failed login
          this.Alert('Timugo alerta', this.mensaje.content, 1);
          this.token = null; //clean  the token
          this.clear();//clean the storage
          resolve(false);
        } else if ( this.mensaje.response === 2 && !(this.mensaje.content.message === "Barbero logeado, pero con pedido en curso") ) {
          //if the barber doesnt have a order in progress, then we need to redirect to order pages to take an order
          this.token = this.mensaje.conten.barber.phone;
          let navigationExtras : NavigationExtras = {
            //sending the city name by url params to the other page
            queryParams: {
              city: this.mensaje.content.barber.city
            }
          }  
          this.barber = {
            idBarber: this.mensaje.content.barber.id,
            name: this.mensaje.content.barber.name,
            lastName: this.mensaje.content.barber.lastName,
            city: this.mensaje.content.barber.city,
          };
  
  
          console.log('Barber From Server',this.barber);
          this.saveInfoBarber(this.barber);//save the information of the barber Async function
          resolve(true); //promise handling
          //this.router.navigate(['/orders'], navigationExtras);
        } else if ( this.mensaje.response === 2 && this.mensaje.content.message === "Barbero logeado, pero con pedido en curso" ) {
          //if the barber have a order in progress, then we need to redirect to the order in progress page to see the details
          console.log("orden actual:",this.mensaje.content.order.id);
          //this.datalocalService.guardarInfoCurrentOrder(this.mensaje.content.order.id);
          
          //this.router.navigate(['/current-order']);
        }
      });
    });
    
  }

  async Alert(titulo: string, mensaje: string, accion: number) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'OK',
          handler: ( ) => {
            // if ( accion === 1 ) {
            //   this.formLogin.reset();
            // }
            console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }
  /* Storage Management */
  async saveInfoBarber(barbero: Barber){
    await Storage.set({
      key: 'barber',
      value:JSON.stringify(barbero)
    });
  }
  async clear() {
    await Storage.clear();
  }
   

}
