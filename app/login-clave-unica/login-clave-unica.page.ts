import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController, Platform, ModalController, LoadingController, MenuController, IonItem, AlertController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
//parametros
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioUtiles } from '../../app/services/ServicioUtiles';
import { ServicioClaveUnica } from '../../app/services/ServicioClaveUnica';
//environment
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login-clave-unica',
  templateUrl: './login-clave-unica.page.html',
  styleUrls: ['./login-clave-unica.page.scss'],
})
export class LoginClaveUnicaPage implements OnInit {

  htmlClaveUnica: any;
  stateClaveUnica: any;
  configClaveUnica: any;
  urlClaveUnica = '';
  
  constructor(
    public navCtrl: NavController,
    public toast: ToastController,     
    public modalCtrl: ModalController,
    public platform: Platform,
    public menu:MenuController,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public utiles: ServicioUtiles,
    public loading: LoadingController,
    public claveUnica: ServicioClaveUnica,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.state) {
        //store the temp in data        
        this.stateClaveUnica = params.state;
        //ahora hacemos la llamada para obtener la configuración de clave unica
        this.obtenerDatosConfiguracion();
      }
    });
  }
  async obtenerDatosConfiguracion(){
    let produccion = '0';
    if (environment.production){
      produccion = '1';
    }

    let loader = await this.loading.create({
      message: 'Buscando...<br>configuración',
      duration: 3000
    });

    await loader.present().then(async () => {
        if (!this.utiles.isAppOnDevice()) {
          //llamada web
          this.claveUnica.postConfiguracionClaveUnica(produccion).subscribe((data:any)=>{
            this.configClaveUnica = data;
            console.log(this.configClaveUnica);
            this.construyeUrl();
            loader.dismiss();
          });
        }
        else{
          //llamada nativa
          this.claveUnica.postConfiguracionClaveUnicaNative(produccion).then((response:any)=>{
            this.configClaveUnica = JSON.parse(response.data);
            console.log(this.configClaveUnica);
            this.construyeUrl();
            loader.dismiss();
          })
        }
    });
  }
  construyeUrl(){
    if (this.configClaveUnica && this.configClaveUnica.Id > 0){
      //"https://accounts.claveunica.gob.cl/openid/authorize/?client_id=08e31dfd6f4d475d9947b70f59755dc8&response_type=code&scope=openid run name&redirect_uri=https%3a%2f%2fapp.mifamilia.com%2fApi%2fClaveUnica&state=68dmfgOr0tSGASttTn1aMml8xLzeL983"
      let url = this.configClaveUnica.Url+'authorize/?client_id=' + this.configClaveUnica.ClientId + 
            '&response_type=code&scope=openid run name&redirect_uri=' + this.configClaveUnica.RedirectUri +
            '&state=' + this.stateClaveUnica;
      this.urlClaveUnica = encodeURI(url);
/*       console.log(this.urlClaveUnica);
      console.log(encodeURI(this.urlClaveUnica)); */
    }
  }
  volver(){
    localStorage.removeItem('STATE_CLAVE_UNICA');
    this.navCtrl.navigateRoot('pre-registro-uno');
  }

}