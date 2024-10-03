import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.page.html',
  styleUrls: ['./listar.page.scss'],
})
export class ListarPage implements OnInit {

  arregloNoticias: any = [
    {
      id: '',
      titulo: '',
      texto: '',
      activo: '',  //Agregue el activo aqui tambien
    }
  ]
  constructor(private bd: ServicebdService, private router: Router) { }

  ngOnInit() {
    this.bd.dbState().subscribe(data=>{
      //validar si la bd esta lista
      if(data){
        //subscribir al observable de la listaNoticias
        this.bd.fetchNoticias().subscribe(res=>{
          this.arregloNoticias = res;
        })
      }
    })
  }

  modificar(x:any){
    let navigationsExtras: NavigationExtras = {
      state: {
        noticia: x
      }
    }
    this.router.navigate(['/modificar'], navigationsExtras);

  }
  eliminar(x:any){
    this.bd.eliminarNoticia(x.idnoticia); //no cambie nada de esto ya que ocupe la misma funcion...
  }

  agregar(){
    this.router.navigate(['/agregar']);
  }

  /*eliminarTabla(){
    this.bd.eliminarTablaNoticia();
  }

  agregarTabla(){
    this.bd.crearTablas();
  }*/

}
