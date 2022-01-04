import { Injectable } from '@angular/core';
//import { Http, Headers } from '@angular/';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ServicioUtiles } from './ServicioUtiles';
import * as moment from 'moment';

@Injectable()
export class ServicioCitas{
    //variables para retornar
    CodigoMensaje: any;
    Mensaje: string;
    arregloGeneral=[];
    arregloDiagnosticos= [];
    arregloFarmacosPendientes= [];
    arregloErrores=[];
    arregloVacunas=[];
    arregloFarmacosUso=[];
    arregloAlimentoEntregado=[];
    arregloAlimentofuturo=[];
    arregloAgrupado = [];
    arregloGenerico = [];
    //nueva implementación vacuna futura
    arregloVacunasFuturas = [];
    constructor(
        private http: HTTP,
        private httpClient: HttpClient,
        private utiles: ServicioUtiles,
      ){ }

    entregaPorMes(uspId, idRyf, nodId, numeroMes, annoConsulta) {
        const body = JSON.stringify({
            UspId: uspId.toString(),
            IdRyf: idRyf.toString(),
            NodId: nodId.toString(),
            NumeroMes: numeroMes.toString(),
            AnnoConsulta: annoConsulta.toString()
        });

        let url = environment.API_ENDPOINT + 'Mes';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }
    entregaPorMesNative(uspId, idRyf, nodId, numeroMes, annoConsulta) {
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
            "UspId": uspId.toString(),
            "IdRyf": idRyf.toString(),
            "NodId": nodId.toString(),
            "NumeroMes": numeroMes.toString(),
            "AnnoConsulta": annoConsulta.toString()
        };

        let url = environment.API_ENDPOINT + 'Mes';
        this.http.setDataSerializer('json');


        return this.http.post(url, body, {});
    }
    entregaPorMesNuevo(uspId, idRyf, nodId, numeroMes, annoConsulta) {
        const body = JSON.stringify({
            UspId: uspId.toString(),
            IdRyf: idRyf.toString(),
            NodId: nodId.toString(),
            NumeroMes: numeroMes.toString(),
            AnnoConsulta: annoConsulta.toString()
        });

        let url = environment.API_ENDPOINT + 'MesNuevo';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }
    entregaPorMesNuevoNative(uspId, idRyf, nodId, numeroMes, annoConsulta) {
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
            "UspId": uspId.toString(),
            "IdRyf": idRyf.toString(),
            "NodId": nodId.toString(),
            "NumeroMes": numeroMes.toString(),
            "AnnoConsulta": annoConsulta.toString()
        };

        let url = environment.API_ENDPOINT + 'MesNuevo';
        this.http.setDataSerializer('json');


        return this.http.post(url, body, {});
    }

    getDiagnosticosByUspId(uspId){

        var url = environment.API_ENDPOINT + 'Diagnostico';
        var urlFarmacoPendiente = environment.API_ENDPOINT + 'FarmacoPendiente';
        var urlVacunas = environment.API_ENDPOINT + 'Vacuna';
        var urlFarmacoUso = environment.API_ENDPOINT + 'FarmacoEnUso';  
        var urlAlimentoEntregado = environment.API_ENDPOINT + 'AlimentoEntregado';  
        var urlAlimentoFuturo = environment.API_ENDPOINT + 'AlimentoFuturo';

        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        let iJson = JSON.stringify({UspId: uspId.toString()});

        let repos = this.httpClient.post(url, iJson, options);
        
        repos.subscribe((response: any) => {
            this.arregloDiagnosticos = response.DiagnosticosUsp;
            if (response.RespuestaBase) {
                if (response.RespuestaBase.CodigoMensaje != 0) {
                    this.arregloErrores.push(response.RespuestaBase);
                }
            }
            //procesar la data
            if (this.arregloDiagnosticos) {
                for (var s in this.arregloDiagnosticos) {
                    //vamos creando una entidad genérica con los resultados
                    let fechaIni = moment(this.arregloDiagnosticos[s].FechaHoraInicio);
                    //definimos la fecha de termino en una hora más de la de inicio
                    let fechaTer = moment(fechaIni).add(1, 'hours');

                    var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                    var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                    let todoElDia = false;
                    //definimos el titulo con el nombre TDA
                    let titulo = this.arregloDiagnosticos[s].NombreUsuario + '|' + this.arregloDiagnosticos[s].NombreTDA;
                    //ahora creamos la entidad con estos valores
                    let entidadDiagnosticosUsp = {
                        title: titulo,
                        startTime: ini,
                        endTime: ter,
                        allDay: todoElDia
                    };
                    //ahora lo insertamos en nuestro arreglo
                    this.arregloGeneral.push(entidadDiagnosticosUsp);

                }
            }
        })

        //farmacos pendientes
        let reposFar = this.httpClient.post(urlFarmacoPendiente, iJson, options);

        reposFar.subscribe(
            (data: any) => {
                this.arregloFarmacosPendientes = data.FarmacosPendientesUsp;
                if (data.RespuestaBase) {
                    if (data.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(data.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloFarmacosPendientes) {
                    for (var s in this.arregloFarmacosPendientes) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloFarmacosPendientes[s].FechaEntrega);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloFarmacosPendientes[s].NombreUsuario + '|' + this.arregloFarmacosPendientes[s].Diagnostico + ' ' + this.arregloFarmacosPendientes[s].Articulo;
                        //ahora creamos la entidad con estos valores
                        let entidadFarmacosPendientes = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadFarmacosPendientes);

                    }
                }

            },
            err => console.error(err),
            () => console.log('get completed')
        );

        //vacunas
        let reposVac = this.httpClient.post(urlVacunas, iJson, options);

        reposVac.subscribe(
            (data: any) => {
                this.arregloVacunas = data.VacunasUsp;
                if (data.RespuestaBase) {
                    if (data.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(data.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloVacunas) {
                    for (var s in this.arregloVacunas) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloVacunas[s].FechaProximaDosis);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloVacunas[s].NombreUsuario + '|' + this.arregloVacunas[s].Descripcion + ', ' + this.arregloVacunas[s].DescripcionDosis;
                        //ahora creamos la entidad con estos valores
                        let entidadVacuna = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadVacuna);

                    }
                }

            },
            err => console.error(err),
            () => console.log('get completed')
        );

        //farmacos en uso
        let repoFarUso = this.httpClient.post(urlFarmacoUso, iJson, options);

        repoFarUso.subscribe(
            (data: any) => {
                this.arregloFarmacosUso = data.FarmacosEnUsoUsp;
                if (data.RespuestaBase) {
                    if (data.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(data.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloFarmacosUso) {
                    for (var s in this.arregloFarmacosUso) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloFarmacosUso[s].FechaEntrega);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloFarmacosUso[s].NombreUsuario + '|' + this.arregloFarmacosUso[s].Descripcion;
                        //ahora creamos la entidad con estos valores
                        let entidadFarUso = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadFarUso);

                    }
                }

            },
            err => console.error(err),
            () => console.log('get completed')
        );

        //alimento entregado
        let repoAlimentoEntregado = this.httpClient.post(urlAlimentoEntregado, iJson, options);

        repoAlimentoEntregado.subscribe(
            (data: any) => {
                this.arregloAlimentoEntregado = data.AlimentosEntregadosUsp;
                if (data.RespuestaBase) {
                    if (data.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(data.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloAlimentoEntregado) {
                    for (var s in this.arregloAlimentoEntregado) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloAlimentoEntregado[s].FechaEntrega);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloAlimentoEntregado[s].NombreUsuario + '|' + this.arregloAlimentoEntregado[s].NombreAlimento;
                        //ahora creamos la entidad con estos valores
                        let entidadAlimento = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadAlimento);

                    }
                }

            },
            err => console.error(err),
            () => console.log('get completed')
        );

        //alimento futuro
        let repoAlimentoFuturo = this.httpClient.post(urlAlimentoFuturo, iJson, options);

        repoAlimentoFuturo.subscribe(
            (data: any) => {
                this.arregloAlimentofuturo = data.AlimentosFuturosUsp;
                if (data.RespuestaBase) {
                    if (data.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(data.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloAlimentofuturo) {
                    for (var s in this.arregloAlimentofuturo) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloAlimentofuturo[s].FechaEntrega);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloAlimentofuturo[s].NombreUsuario + '|' + this.arregloAlimentofuturo[s].NombreAlimento;
                        //ahora creamos la entidad con estos valores
                        let entidadAlimento = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadAlimento);

                    }
                }

            },
            err => console.error(err),
            () => console.log('get completed')
        );


        return this.arregloGeneral;
    }

    getDiagnosticosByUspIdNative(uspId){

        var url = environment.API_ENDPOINT + 'Diagnostico';
        var urlFarmacoPendiente = environment.API_ENDPOINT + 'FarmacoPendiente';
        var urlVacunas = environment.API_ENDPOINT + 'Vacuna';
        var urlFarmacoUso = environment.API_ENDPOINT + 'FarmacoEnUso';  
        var urlAlimentoEntregado = environment.API_ENDPOINT + 'AlimentoEntregado';  
        var urlAlimentoFuturo = environment.API_ENDPOINT + 'AlimentoFuturo';

        let iJson = {UspId: uspId.toString()};

        let repos = this.http.post(url, iJson, {});
        
        repos.then((response: any) => {
            var data = JSON.parse(response.data);
            this.arregloDiagnosticos = data.DiagnosticosUsp;
            if (data.RespuestaBase) {
                if (data.RespuestaBase.CodigoMensaje != 0) {
                    this.arregloErrores.push(data.RespuestaBase);
                }
            }
            //procesar la data
            if (this.arregloDiagnosticos) {
                for (var s in this.arregloDiagnosticos) {
                    //vamos creando una entidad genérica con los resultados
                    let fechaIni = moment(this.arregloDiagnosticos[s].FechaHoraInicio);
                    //definimos la fecha de termino en una hora más de la de inicio
                    let fechaTer = moment(fechaIni).add(1, 'hours');

                    var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                    var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                    let todoElDia = false;
                    //definimos el titulo con el nombre TDA
                    let titulo = this.arregloDiagnosticos[s].NombreUsuario + '|' + this.arregloDiagnosticos[s].NombreTDA;
                    //ahora creamos la entidad con estos valores
                    let entidadDiagnosticosUsp = {
                        title: titulo,
                        startTime: ini,
                        endTime: ter,
                        allDay: todoElDia
                    };
                    //ahora lo insertamos en nuestro arreglo
                    this.arregloGeneral.push(entidadDiagnosticosUsp);

                }
            }
        })

        //farmacos pendientes
        let reposFar = this.http.post(urlFarmacoPendiente, iJson, {});

        reposFar.then(
            (data: any) => {
                var response= JSON.parse(data.data);
                this.arregloFarmacosPendientes = response.FarmacosPendientesUsp;
                if (response.RespuestaBase) {
                    if (response.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(response.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloFarmacosPendientes) {
                    for (var s in this.arregloFarmacosPendientes) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloFarmacosPendientes[s].FechaEntrega);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloFarmacosPendientes[s].NombreUsuario + '|' + this.arregloFarmacosPendientes[s].Diagnostico + ' ' + this.arregloFarmacosPendientes[s].Articulo;
                        //ahora creamos la entidad con estos valores
                        let entidadFarmacosPendientes = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadFarmacosPendientes);

                    }
                }

            }
        );

        //vacunas
        let reposVac = this.http.post(urlVacunas, iJson, {});

        reposVac.then(
            (data: any) => {
                var response = JSON.parse(data.data);
                this.arregloVacunas = response.VacunasUsp;
                if (response.RespuestaBase) {
                    if (response.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(response.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloVacunas) {
                    for (var s in this.arregloVacunas) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloVacunas[s].FechaProximaDosis);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloVacunas[s].NombreUsuario + '|' + this.arregloVacunas[s].Descripcion + ', ' + this.arregloVacunas[s].DescripcionDosis;
                        //ahora creamos la entidad con estos valores
                        let entidadVacuna = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadVacuna);

                    }
                }

            }
        );

        //farmacos en uso
        let repoFarUso = this.http.post(urlFarmacoUso, iJson, {});

        repoFarUso.then(
            (data: any) => {
                var response = JSON.parse(data.data);
                this.arregloFarmacosUso = response.FarmacosEnUsoUsp;
                if (response.RespuestaBase) {
                    if (response.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(response.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloFarmacosUso) {
                    for (var s in this.arregloFarmacosUso) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloFarmacosUso[s].FechaEntrega);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloFarmacosUso[s].NombreUsuario + '|' + this.arregloFarmacosUso[s].Descripcion;
                        //ahora creamos la entidad con estos valores
                        let entidadFarUso = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadFarUso);

                    }
                }

            }
        );

        //alimento entregado
        let repoAlimentoEntregado = this.http.post(urlAlimentoEntregado, iJson, {});

        repoAlimentoEntregado.then(
            (data: any) => {
                var response = JSON.parse(data.data);
                this.arregloAlimentoEntregado = response.AlimentosEntregadosUsp;
                if (response.RespuestaBase) {
                    if (response.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(response.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloAlimentoEntregado) {
                    for (var s in this.arregloAlimentoEntregado) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloAlimentoEntregado[s].FechaEntrega);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloAlimentoEntregado[s].NombreUsuario + '|' + this.arregloAlimentoEntregado[s].NombreAlimento;
                        //ahora creamos la entidad con estos valores
                        let entidadAlimento = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadAlimento);

                    }
                }

            }
        );

        //alimento futuro
        let repoAlimentoFuturo = this.http.post(urlAlimentoFuturo, iJson, {});

        repoAlimentoFuturo.then(
            (data: any) => {
                var response = JSON.parse(data.data);
                this.arregloAlimentofuturo = response.AlimentosFuturosUsp;
                if (response.RespuestaBase) {
                    if (response.RespuestaBase.CodigoMensaje != 0) {
                        this.arregloErrores.push(response.RespuestaBase);
                    }
                }
                //procesar la data
                if (this.arregloAlimentofuturo) {
                    for (var s in this.arregloAlimentofuturo) {
                        //vamos creando una entidad genérica con los resultados
                        let fechaIni = moment(this.arregloAlimentofuturo[s].FechaEntrega);
                        //definimos la fecha de termino en una hora más de la de inicio
                        let fechaTer = moment(fechaIni).add(1, 'hours');

                        var ini = new Date(Date.UTC(moment(fechaIni).year(), moment(fechaIni).month(), moment(fechaIni).date(), moment(fechaIni).hour(), moment(fechaIni).minute(), moment(fechaIni).second(), 0));
                        var ter = new Date(Date.UTC(moment(fechaTer).year(), moment(fechaTer).month(), moment(fechaTer).date(), moment(fechaTer).hour(), moment(fechaTer).minute(), moment(fechaTer).second(), 0));
                        let todoElDia = false;
                        //definimos el titulo con el nombre diagnostico + articulo
                        let titulo = this.arregloAlimentofuturo[s].NombreUsuario + '|' + this.arregloAlimentofuturo[s].NombreAlimento;
                        //ahora creamos la entidad con estos valores
                        let entidadAlimento = {
                            title: titulo,
                            startTime: ini,
                            endTime: ter,
                            allDay: todoElDia
                        };
                        //ahora lo insertamos en nuestro arreglo
                        this.arregloGeneral.push(entidadAlimento);

                    }
                }

            }
        );


        return this.arregloGeneral;
    }
    //get cupos
    //http://localhost:27563/api/ObtenerDisponibilidad?start=2020-11-10T00:00:00-04:00&end=2020-11-10T23:59:59-04:00&organization=199991&patient=17000904-5&serviceType=346
    getDisponibilidad(start, end, organization, patient, serviceType, status, count, operacion, nodId){
        let urlCorta = environment.API_ENDPOINT + 'ObtenerDisponibilidad' +'?start=' + start + '&end=' + end + '&organization='+ organization + '&patient=' + patient + '&serviceType='+ serviceType + '&status=' + status + '&count=' + count + '&operacion=' + operacion + '&nodId=' + nodId;
        let data = this.httpClient.get(urlCorta,{});
        return data;
    }
    getDisponibilidadNative(start, end, organization, patient, serviceType, status, count, operacion, nodId){
        let urlCorta = environment.API_ENDPOINT+ 'ObtenerDisponibilidad' +'?start=' + start + '&end=' + end + '&organization='+ organization + '&patient=' + patient + '&serviceType='+ serviceType + '&status=' + status + '&count=' + count + '&operacion=' + operacion + '&nodId=' + nodId;
        let data = this.http.get(urlCorta, {}, {});
        return data;
    }
/*     getDisponibilidadApi(start, end, organization, patient, serviceType, status, count, operacion, nodId, token){
        let urlCorta = environment.API_ENDPOINT + 'ObtenerDisponibilidadApi' +'?start=' + start + '&end=' + end + '&organization='+ organization + '&patient=' + patient + '&serviceType='+ serviceType + '&status=' + status + '&count=' + count + '&operacion=' + operacion + '&nodId=' + nodId + '&token=' + token;
        let data = this.httpClient.get(urlCorta,{});
        return data;
    }
    getDisponibilidadApiNative(start, end, organization, patient, serviceType, status, count, operacion, nodId, token){
        let urlCorta = environment.API_ENDPOINT+ 'ObtenerDisponibilidadApi' +'?start=' + start + '&end=' + end + '&organization='+ organization + '&patient=' + patient + '&serviceType='+ serviceType + '&status=' + status + '&count=' + count + '&operacion=' + operacion + '&nodId=' + nodId + '&token=' + token;
        let data = this.http.get(urlCorta, {}, {});
        return data;
    } */
    getDisponibilidadApi(start, end, organization, patient, serviceType, status, count, operacion, nodId){
        let urlCorta = environment.API_ENDPOINT + 'ObtenerDisponibilidadApi' +'?start=' + start + '&end=' + end + '&organization='+ organization + '&patient=' + patient + '&serviceType='+ serviceType + '&status=' + status + '&count=' + count + '&operacion=' + operacion + '&nodId=' + nodId;
        let data = this.httpClient.get(urlCorta,{});
        return data;
    }
    getDisponibilidadApiNative(start, end, organization, patient, serviceType, status, count, operacion, nodId){
        let urlCorta = environment.API_ENDPOINT+ 'ObtenerDisponibilidadApi' +'?start=' + start + '&end=' + end + '&organization='+ organization + '&patient=' + patient + '&serviceType='+ serviceType + '&status=' + status + '&count=' + count + '&operacion=' + operacion + '&nodId=' + nodId;
        let data = this.http.get(urlCorta, {}, {});
        return data;
    }
    //las operaciones pueden ser
    //booked reservar cita
    //confirmed confirmar cita
    //cancelled cancelar cita
    //noshow informar que el paciente no asistió a la cita
    //fulfilled informar que la cita se llevo a cabo
    getOperacionCita(idCita, idPaciente, operacion){
        let urlCorta = environment.API_ENDPOINT + 'ReservarCita' +'?idAppoinment=' + idCita + '&patient=' + idPaciente + '&operacion=' + operacion;
        let data = this.httpClient.get(urlCorta,{});
        return data;
    }
    getOperacionCitaNative(idCita, idPaciente, operacion){
        let urlCorta = environment.API_ENDPOINT + 'ReservarCita' +'?idAppoinment=' + idCita + '&patient=' + idPaciente + '&operacion=' + operacion;
        let data = this.http.get(urlCorta, {}, {});
        return data;
    }
    getCitasWeb(start, end, estado, idPaciente){
        let urlCorta = environment.API_ENDPOINT + 'CitaWeb' +'?start=' + start + '&end=' + end + '&estado=' + estado +'&idPaciente=' + idPaciente;
        let data = this.httpClient.get(urlCorta,{});
        return data;
    }
    getCitasWebNative(start, end, estado, idPaciente){
        let urlCorta = environment.API_ENDPOINT + 'CitaWeb' +'?start=' + start + '&end=' + end + '&estado=' + estado+'&idPaciente=' + idPaciente;
        let data = this.http.get(urlCorta, {}, {});
        return data;
    }
    postObtenerTokenManagement(){

        let url = environment.API_ENDPOINT + 'ObtenerDisponibilidadApi';
        let httpHeaders = new HttpHeaders({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");
    
        let options = { headers: httpHeaders };
    
        let data = this.httpClient.post(url, {}, options);
        return data;
      }
      postObtenerTokenManagementNative(){
        //realizar la llamada post nativa
        const headers = new Headers;
    
        let url = environment.API_ENDPOINT + 'ObtenerDisponibilidadApi';
        this.http.setDataSerializer('json');
    
    
        return this.http.post(url, {}, {});
      }
      entregaPorMesNuevoApi(uspId, idRyf, nodId, numeroMes, annoConsulta) {
        const body = JSON.stringify({
            UspId: uspId.toString(),
            IdRyf: idRyf.toString(),
            NodId: nodId.toString(),
            NumeroMes: numeroMes.toString(),
            AnnoConsulta: annoConsulta.toString()
        });

        let url = environment.API_ENDPOINT + 'MesNuevoApi';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }
    entregaPorMesNuevoApiNative(uspId, idRyf, nodId, numeroMes, annoConsulta) {
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
            "UspId": uspId.toString(),
            "IdRyf": idRyf.toString(),
            "NodId": nodId.toString(),
            "NumeroMes": numeroMes.toString(),
            "AnnoConsulta": annoConsulta.toString()
        };

        let url = environment.API_ENDPOINT + 'MesNuevoApi';
        this.http.setDataSerializer('json');


        return this.http.post(url, body, {});
    }
    //estos metodos entregan los eventos para las notificaciones
    entregaPorMesNuevoLivianoApi(uspId, idRyf, nodId, numeroMes, annoConsulta) {
        const body = JSON.stringify({
            UspId: uspId.toString(),
            IdRyf: idRyf.toString(),
            NodId: nodId.toString(),
            NumeroMes: numeroMes.toString(),
            AnnoConsulta: annoConsulta.toString()
        });

        let url = environment.API_ENDPOINT + 'MesNuevoLivianoApi';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }
    entregaPorMesNuevoLivianoApiNative(uspId, idRyf, nodId, numeroMes, annoConsulta) {
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
            "UspId": uspId.toString(),
            "IdRyf": idRyf.toString(),
            "NodId": nodId.toString(),
            "NumeroMes": numeroMes.toString(),
            "AnnoConsulta": annoConsulta.toString()
        };

        let url = environment.API_ENDPOINT + 'MesNuevoLivianoApi';
        this.http.setDataSerializer('json');


        return this.http.post(url, body, {});
    }
}