import { Component, OnInit } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-nueva',
  templateUrl: './nueva.page.html',
  styleUrls: ['./nueva.page.scss'],
})
export class NuevaPage implements OnInit {
  nombre: string = "";
  constructor(private storage: NativeStorage,private alertController: AlertController) { }

  ngOnInit() {
  }

  consultar(){
    this.storage.getItem(this.nombre).then(data=>{
      this.presentAlert("Valor es: " + data);
    })
  }

  async presentAlert(msj:string) {
    const alert = await this.alertController.create({
      header: 'Info',
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

}
