import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {
  //variable de conexión a Base de Datos
  public database!: SQLiteObject;

  //variables de creación de Tablas
  tablaNoticia: string = "CREATE TABLE IF NOT EXISTS noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto TEXT NOT NULL, activo INTEGER DEFAULT 1);"; //-- Columna activo para eliminar lógicamente
  //-- 1 para activo, 0 para inactivo
  //variables para los insert por defecto en nuestras tablas
  registroNoticia: string = "INSERT or IGNORE INTO noticia(idnoticia, titulo, texto, activo) VALUES (1,'Soy un titulo', 'Soy el texto de esta noticia que se esta insertando de manera autmática',1)";
// DESACTIVADO ES 0
//ACTIVADO ES 1
  //variables para guardar los datos de las consultas en las tablas
  listadoNoticias = new BehaviorSubject([]);

  //variable para el status de la Base de datos
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private sqlite: SQLite, private platform: Platform, private alertController: AlertController) {
    this.createBD();
   }

  async presentAlert(titulo: string, msj:string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  //metodos para manipular los observables
  fetchNoticias(): Observable<Noticias[]>{
    return this.listadoNoticias.asObservable();
  }

  dbState(){
    return this.isDBReady.asObservable();
  }

  //función para crear la Base de Datos
  createBD(){
    //varificar si la plataforma esta disponible
    this.platform.ready().then(()=>{
      //crear la Base de Datos
      this.sqlite.create({
        name: 'noticias.db',
        location: 'default'
      }).then((db: SQLiteObject)=>{
        //capturar la conexion a la BD
        this.database = db;
        //llamamos a la función para crear las tablas
        this.crearTablas();
      }).catch(e=>{
        this.presentAlert('Base de Datos', 'Error en crear la BD: ' + JSON.stringify(e));
      })
    })

  }

  async crearTablas(){
    try{
      //ejecuto la creación de Tablas
      await this.database.executeSql(this.tablaNoticia, []);

      //ejecuto los insert por defecto en el caso que existan
      await this.database.executeSql(this.registroNoticia, []);

      this.seleccionarNoticias();
      //modifico el estado de la Base de Datos
      this.isDBReady.next(true);

    }catch(e){
      this.presentAlert('Creación de Tablas', 'Error en crear las tablas: ' + JSON.stringify(e));
    }
  }

  seleccionarNoticias(){
    return this.database.executeSql('SELECT * FROM noticia Where activo = 1', []).then(res=>{  // Agrege "Where activo = 1" el 1 son para las cosas habilitadas.
       //variable para almacenar el resultado de la consulta
       let items: Noticias[] = [];
       //valido si trae al menos un registro
       if(res.rows.length > 0){
        //recorro mi resultado
        for(var i=0; i < res.rows.length; i++){
          //agrego los registros a mi lista
          items.push({
            idnoticia: res.rows.item(i).idnoticia,
            titulo: res.rows.item(i).titulo,
            texto: res.rows.item(i).texto,
            activo: res.rows.item(i).activo  //Agrege el activo
          })
        }
        
       }
       //actualizar el observable
       this.listadoNoticias.next(items as any);

    })
  }
 
  eliminarNoticia(id: string) { //Cree un update que llama a la tabla y modifica el activo y coloca 0 para deshabilitarla 
    return this.database.executeSql('UPDATE noticia SET activo = 0 WHERE idnoticia = ?', [id])  //Cambie toda esta funcion menos el nombre 
      .then(res => {
        this.presentAlert("Eliminar", "Noticia marcada como inactiva");
        this.seleccionarNoticias();  // Actualizar la lista de noticias
      })
      .catch(e => {
        this.presentAlert('Eliminar', 'Error: ' + JSON.stringify(e));
      });
  }
  

  modificarNoticia(id:string, titulo:string, texto: string){
    this.presentAlert("service","ID: " + id);
    return this.database.executeSql('UPDATE noticia SET titulo = ?, texto = ? WHERE idnoticia = ?',[titulo,texto,id]).then(res=>{
      this.presentAlert("Modificar","Noticia Modificada");
      this.seleccionarNoticias();
    }).catch(e=>{
      this.presentAlert('Modificar', 'Error: ' + JSON.stringify(e));
    })

  }

  insertarNoticia(titulo:string, texto:string){
    return this.database.executeSql('INSERT INTO noticia(titulo,texto) VALUES (?,?)',[titulo, texto]).then(res=>{
      this.presentAlert("Insertar","Noticia Registrada");
      this.seleccionarNoticias();
    }).catch(e=>{
      this.presentAlert('Insertar', 'Error: ' + JSON.stringify(e));
    })
  }

  /*eliminarTablaNoticia() {
    return this.database.executeSql('DROP TABLE IF EXISTS noticia', [])
      .then(res => {
        this.presentAlert("Eliminar Tabla", "Tabla noticia eliminada");
        // Puedes llamar a crearTablas() si quieres recrear las tablas después de eliminar
        this.crearTablas();
      })
      .catch(e => {
        this.presentAlert('Eliminar Tabla', 'Error: ' + JSON.stringify(e));
      });
  }*/


}
