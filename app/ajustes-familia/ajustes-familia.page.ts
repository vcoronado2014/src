import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ToastController, Platform, LoadingController, MenuController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
//SERVICIOS
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { environment } from 'src/environments/environment';
//plugins
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ServicioImagen } from '../services/ServicioImagen';

@Component({
  selector: 'app-ajustes-familia',
  templateUrl: './ajustes-familia.page.html',
  styleUrls: ['./ajustes-familia.page.scss'],
})
export class AjustesFamiliaPage implements OnInit {
  public userData;
  public usuarioAps;
  public uspId;
  image: string = null;
  lastImage: string = null;
  nombrePaciente = '';

  imagenBD;
  public color: string = "#127bdc";
  fileP: File;
  //ACA QUEDE, ESTOY ARMANDO LA PANTALLA DE AJUSTES
  //color
  miColor = '#FF4081';
  tieneRegistro = false;
  constructor(
    public modalCtrl: ModalController,
    public utiles: ServicioUtiles,
    public navCtrl: NavController,
    public toast: ToastController,
    public platform: Platform,
    public menu: MenuController,
    public loading: LoadingController,
    private img: ServicioImagen,
    public activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    if (localStorage.getItem('TIENE_REGISTRO')) {
      if (localStorage.getItem('TIENE_REGISTRO').toLowerCase() == 'true') {
        this.tieneRegistro = true;
      }

    }
    //obtener de query params
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.usuario) {
        this.usuarioAps = JSON.parse(params.usuario);
        this.image = this.usuarioAps.UrlImagen;
        this.miColor = this.utiles.entregaColor(this.usuarioAps);
        this.color = this.miColor;//this.usuarioAps.Color;
        this.nombrePaciente = this.usuarioAps.Nombres + ' ' + this.usuarioAps.ApellidoPaterno + ' ' + this.usuarioAps.ApellidoMaterno;
        //console.log(this.usuarioAps);
      }
    });
  }

  setColor(color) {
    this.color = color;
  }
  changeListener($event): void {
    this.fileP = $event.target.files[0];

    if (this.fileP) {
      if (this.fileP.size <= 4096000) {
        this.putImagen(this.fileP);
      } else {
        //this.presentToast('El tamaño de la imágen excede el máximo permitido.'); 
        this.utiles.presentToast('El tamaño de la imágen excede el máximo permitido.', 'center', 3000);
      }
    } else {
      //this.presentToast('No ha seleccionado ninguna imágen válida.'); 
      this.utiles.presentToast('No ha seleccionado ninguna imágen válida.', 'center', 3000);
    }
  }

  async putImagen(files: any) {
    var uspId = this.usuarioAps.Id.toString();
    //console.log(files.size);
    let loader = await this.loading.create({
      message: 'Guardando...<br>Imagen del usuario.',
      duration: 20000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.img.putImagen(uspId, files).subscribe((data: any) => {
          if (data && data != '') {
            this.image = environment.URL_FOTOS + data;
            //cambiar la imagen del usuario aps
            //o de la familia
            if (this.usuarioAps) {
              if (this.usuarioAps.UrlImagen) {
                //dejamos al usuario con la nueva imagen
                this.usuarioAps.UrlImagen = environment.URL_FOTOS + data;
              }
            }
            if (sessionStorage.UsuarioAps) {
              var nuevoUsuarioAps = JSON.parse(sessionStorage.UsuarioAps);
              //cambiamos este elemento solo si el usuario existe
              if (nuevoUsuarioAps.Id == uspId) {
                //nuevoUsuarioAps.UrlImagen = environment.URL_FOTOS + data;
                nuevoUsuarioAps.UrlImagen = data;
                //debemos guardar el objeto serializado
                sessionStorage.setItem('UsuarioAps', JSON.stringify(nuevoUsuarioAps));
                //gurdamos mi imagen en local storage
                localStorage.setItem('MI_IMAGEN', data);
              }
              else {
                //si no es el mismo hay que buscarlo en la lista de familia y cambiarlo
                var usuariosFamilia = JSON.parse(localStorage.getItem('UsuariosFamilia'));
                if (usuariosFamilia && usuariosFamilia.length > 0) {
                  usuariosFamilia.forEach(usuario => {
                    if (usuario.Id == uspId) {
                      //usuario.UrlImagen = environment.URL_FOTOS + data;
                      usuario.UrlImagen = data;
                    }
                  });
                  //ahora serializamos y cambiamos
                  localStorage.setItem('UsuariosFamilia', JSON.stringify(usuariosFamilia));
                }
              }


            }
            this.utiles.presentToast('Avatar guardado con éxito', 'bottom', 3000);
          }
          else {
            this.utiles.presentToast('Ocurrió un error al guardar el archivo', 'bottom', 3000);
          }
          //terminamos loader
          loader.dismiss();
        })
      }
      else {
        this.img.putImagen(uspId, files).subscribe((data: any) => {
          if (data && data != '') {
            this.image = environment.URL_FOTOS + data;
            //cambiar la imagen del usuario aps
            //o de la familia
            if (this.usuarioAps) {
              if (this.usuarioAps.UrlImagen) {
                //dejamos al usuario con la nueva imagen
                this.usuarioAps.UrlImagen = environment.URL_FOTOS + data;
              }
            }
            if (sessionStorage.UsuarioAps) {
              var nuevoUsuarioAps = JSON.parse(sessionStorage.UsuarioAps);
              //cambiamos este elemento solo si el usuario existe
              if (nuevoUsuarioAps.Id == uspId) {
                //nuevoUsuarioAps.UrlImagen = environment.URL_FOTOS + data;
                nuevoUsuarioAps.UrlImagen = data;
                //debemos guardar el objeto serializado
                sessionStorage.setItem('UsuarioAps', JSON.stringify(nuevoUsuarioAps));
                //gurdamos mi imagen en local storage
                localStorage.setItem('MI_IMAGEN', data);
              }
              else {
                //si no es el mismo hay que buscarlo en la lista de familia y cambiarlo
                var usuariosFamilia = JSON.parse(localStorage.getItem('UsuariosFamilia'));
                if (usuariosFamilia && usuariosFamilia.length > 0) {
                  usuariosFamilia.forEach(usuario => {
                    if (usuario.Id == uspId) {
                      //usuario.UrlImagen = environment.URL_FOTOS + data;
                      usuario.UrlImagen = data;
                    }
                  });
                  //ahora serializamos y cambiamos
                  localStorage.setItem('UsuariosFamilia', JSON.stringify(usuariosFamilia));
                }
              }


            }
            this.utiles.presentToast('Avatar guardado con éxito', 'bottom', 3000);
          }
          else {
            this.utiles.presentToast('Ocurrió un error al guardar el archivo', 'bottom', 3000);
          }
          //terminamos loader
          loader.dismiss();
        })
      }
    });
  }

  async putColor() {
    var uspId = this.usuarioAps.Id.toString();
    var colorGuardar = this.color;

    let loader = await this.loading.create({
      message: 'Guardando...<br>Color del usuario.',
      duration: 20000
    });

    await loader.present().then(async () => {
      if (!this.utiles.isAppOnDevice()) {
        //llamada web
        this.img.putColor(uspId, colorGuardar).subscribe((data: any) => {
          if (data) {
            this.color = data;
            if (this.usuarioAps) {
              if (this.usuarioAps.Color) {
                //dejamos al usuario con la nueva imagen
                this.usuarioAps.Color = data;
              }
            }
            if (sessionStorage.UsuarioAps) {
              var nuevoUsuarioAps = JSON.parse(sessionStorage.UsuarioAps);
              //cambiamos este elemento solo si el usuario existe
              if (nuevoUsuarioAps.Id == uspId) {
                nuevoUsuarioAps.Color = data;
                sessionStorage.setItem('UsuarioAps', JSON.stringify(nuevoUsuarioAps));
              }
              else {
                //si no es el mismo hay que buscarlo en la lista de familia y cambiarlo
                var usuariosFamilia = JSON.parse(localStorage.getItem('UsuariosFamilia'));
                if (usuariosFamilia && usuariosFamilia.length > 0) {
                  usuariosFamilia.forEach(usuario => {
                    if (usuario.Id == uspId) {
                      usuario.Color = data;
                    }
                  });
                  //ahora serializamos y cambiamos
                  localStorage.setItem('UsuariosFamilia', JSON.stringify(usuariosFamilia));
                }
              }


            }
            localStorage.setItem('MI_COLOR', data);
          }
          //terminamos loader
          loader.dismiss();
        })
      }
      else {
        //lamada nativa
        this.img.putColorNative(uspId, colorGuardar).then((data: any) => {
          if (data) {
            this.utiles.cambiaColorLocalStorage(JSON.parse(data.data));
            this.color = JSON.parse(data.data);
            if (this.usuarioAps) {
              if (this.usuarioAps.Color) {
                //dejamos al usuario con la nueva imagen
                this.usuarioAps.Color = JSON.parse(data.data);
              }
            }
            if (sessionStorage.UsuarioAps) {
              var nuevoUsuarioAps = JSON.parse(sessionStorage.UsuarioAps);
              //cambiamos este elemento solo si el usuario existe
              if (nuevoUsuarioAps.Id == uspId) {
                nuevoUsuarioAps.Color = JSON.parse(data.data);
                sessionStorage.setItem('UsuarioAps', JSON.stringify(nuevoUsuarioAps));
              }
              else {
                //si no es el mismo hay que buscarlo en la lista de familia y cambiarlo
                var usuariosFamilia = JSON.parse(localStorage.getItem('UsuariosFamilia'));
                if (usuariosFamilia && usuariosFamilia.length > 0) {
                  usuariosFamilia.forEach(usuario => {
                    if (usuario.Id == uspId) {
                      usuario.Color = JSON.parse(data.data);
                    }
                  });
                  //ahora serializamos y cambiamos
                  localStorage.setItem('UsuariosFamilia', JSON.stringify(usuariosFamilia));
                }
              }

            }
          }
          //terminamos loader
          loader.dismiss();
        },
          (error) => {
            loader.dismiss();
            this.utiles.presentToast(error, 'bottom', 4000);
          }
        )

      }
    });
  }

  abrirEditar() {
    //debemos pasar al usuario 
    let query = {
      usuario: null
    };
    query = { usuario: JSON.stringify(this.usuarioAps) }
    const navigationExtras: NavigationExtras = {
      queryParams: query
    };
    this.navCtrl.navigateRoot(['contactabilidad'], navigationExtras);
  }

}
