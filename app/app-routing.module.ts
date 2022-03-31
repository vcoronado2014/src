import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
/*   {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }, */
  {
    path: 'antecedentes',
    loadChildren: () => import('./antecedentes/antecedentes.module').then( m => m.AntecedentesPageModule)
  },
  {
    path: 'detail-usuario',
    loadChildren: () => import('./detail-usuario/detail-usuario.module').then( m => m.DetailUsuarioPageModule)
  },
  {
    path: 'familia',
    loadChildren: () => import('./familia/familia.module').then( m => m.FamiliaPageModule)
  },
  {
    path: 'modal-ajustes',
    loadChildren: () => import('./modal-ajustes/modal-ajustes.module').then( m => m.ModalAjustesPageModule)
  },
  {
    path: 'ordenes',
    loadChildren: () => import('./ordenes/ordenes.module').then( m => m.OrdenesPageModule)
  },
  {
    path: 'modal-examenes',
    loadChildren: () => import('./modal-examenes/modal-examenes.module').then( m => m.ModalExamenesPageModule)
  },
  {
    path: 'calendario',
    loadChildren: () => import('./calendario/calendario.module').then( m => m.CalendarioPageModule)
  },
  {
    path: 'modal-detalle-cita',
    loadChildren: () => import('./modal-detalle-cita/modal-detalle-cita.module').then( m => m.ModalDetalleCitaPageModule)
  },
  {
    path: 'modal-operacion-cita',
    loadChildren: () => import('./modal-operacion-cita/modal-operacion-cita.module').then( m => m.ModalOperacionCitaPageModule)
  },
  {
    path: 'cupos-disponibles',
    loadChildren: () => import('./cupos-disponibles/cupos-disponibles.module').then( m => m.CuposDisponiblesPageModule)
  },
  {
    path: 'pre-tiposatencion',
    loadChildren: () => import('./pre-tiposatencion/pre-tiposatencion.module').then( m => m.PreTiposatencionPageModule)
  },
  {
    path: 'busqueda-avanzada',
    loadChildren: () => import('./busqueda-avanzada/busqueda-avanzada.module').then( m => m.BusquedaAvanzadaPageModule)
  },
  {
    path: 'nuevo-login',
    loadChildren: () => import('./nuevo-login/nuevo-login.module').then( m => m.NuevoLoginPageModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'registro-uno',
    loadChildren: () => import('./registro-uno/registro-uno.module').then( m => m.RegistroUnoPageModule)
  },
  {
    path: 'recuperar-clave',
    loadChildren: () => import('./recuperar-clave/recuperar-clave.module').then( m => m.RecuperarClavePageModule)
  },
  {
    path: 'login-clave-unica',
    loadChildren: () => import('./login-clave-unica/login-clave-unica.module').then( m => m.LoginClaveUnicaPageModule)
  },
  {
    path: 'registro-usuario',
    loadChildren: () => import('./registro-usuario/registro-usuario.module').then( m => m.RegistroUsuarioPageModule)
  },
  {
    path: 'pre-registro-uno',
    loadChildren: () => import('./pre-registro-uno/pre-registro-uno.module').then( m => m.PreRegistroUnoPageModule)
  },
  {
    path: 'contactabilidad',
    loadChildren: () => import('./contactabilidad/contactabilidad.module').then( m => m.ContactabilidadPageModule)
  },
  {
    path: 'interconsultas',
    loadChildren: () => import('./interconsultas/interconsultas.module').then( m => m.InterconsultasPageModule)
  },
  {
    path: 'ajustes-familia',
    loadChildren: () => import('./ajustes-familia/ajustes-familia.module').then( m => m.AjustesFamiliaPageModule)
  },
  {
    path: 'seleccion-usuario',
    loadChildren: () => import('./seleccion-usuario/seleccion-usuario.module').then( m => m.SeleccionUsuarioPageModule)
  },
  {
    path: 'validacion-factor',
    loadChildren: () => import('./validacion-factor/validacion-factor.module').then( m => m.ValidacionFactorPageModule)
  },
  {
    path: 'asociar-familia',
    loadChildren: () => import('./asociar-familia/asociar-familia.module').then( m => m.AsociarFamiliaPageModule)
  },
  {
    path: 'quitar-familia',
    loadChildren: () => import('./quitar-familia/quitar-familia.module').then( m => m.QuitarFamiliaPageModule)
  },
  {
    path: 'pre-ordenes',
    loadChildren: () => import('./pre-ordenes/pre-ordenes.module').then( m => m.PreOrdenesPageModule)
  },
  {
    path: 'modal-alertas',
    loadChildren: () => import('./modal-alertas/modal-alertas.module').then( m => m.ModalAlertasPageModule)
  },
  {
    path: 'modal-capsulas',
    loadChildren: () => import('./modal-capsulas/modal-capsulas.module').then( m => m.ModalCapsulasPageModule)
  },
  {
    path: 'resultados',
    loadChildren: () => import('./resultados/resultados.module').then( m => m.ResultadosPageModule)
  },
  {
    path: 'contacto',
    loadChildren: () => import('./contacto/contacto.module').then( m => m.ContactoPageModule)
  },
  {
    path: 'modal-busqueda',
    loadChildren: () => import('./modal-busqueda/modal-busqueda.module').then( m => m.ModalBusquedaPageModule)
  },
  {
    path: 'error',
    loadChildren: () => import('./error/error.module').then( m => m.ErrorPageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
