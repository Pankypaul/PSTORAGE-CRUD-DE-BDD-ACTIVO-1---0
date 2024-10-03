import { Component, OnInit } from '@angular/core';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit {
  titulo: string = "";
  texto: string = "";

  constructor(private bd: ServicebdService) { }

  ngOnInit() {
  }

  insertar(){
    this.bd.insertarNoticia(this.titulo, this.texto);
  }

}
