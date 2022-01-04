import { Injectable } from '@angular/core';
//import { Http, Headers } from '@angular/';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ServicioImagen{
    constructor(
        private http: HTTP,
        private httpClient: HttpClient
      ){ }

    

    putImagen(uspId, files) {
        let url = environment.API_ENDPOINT + 'File';
        var model = new FormData();
        model.append("uspId", uspId);
        model.append("fileName", files);
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        var options = {
            fileKey: "fileName",
            fileName: files,
            chunkedMode: false,
            mimeType: "multipart/form-data",
            params: { 'fileName': files, 'uspId': uspId }
        };

        let data = this.httpClient.post(url, model, options);
        return data;
    }
    putImagenNative(uspId, files) {
        var model = new FormData();
        model.append("uspId", uspId);
        model.append("fileName", files);

        let url = environment.API_ENDPOINT + 'File';
        var options = {
            fileKey: "fileName",
            fileName: files,
            chunkedMode: false,
            mimeType: "multipart/form-data",
            params: { 'fileName': files, 'uspId': uspId }
        };
        this.http.setDataSerializer('json');
        return this.http.post(url, model, options);
    }
    putColor(uspId, color) {
        const body = JSON.stringify({ UspId: uspId.toString(), Color: color });

        let url = environment.API_ENDPOINT + 'Color';
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        httpHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        httpHeaders.set("Access-Control-Allow-Headers", "*");

        let options = { headers: httpHeaders };

        let data = this.httpClient.put(url, body, options);
        return data;
    }
    putColorNative(uspId, color) {
        //realizar la llamada post nativa
        const headers = new Headers;
        const body =
        {
            "UspId": uspId.toString(),
            "Color": color
        };

        let url = environment.API_ENDPOINT + 'Color';
        this.http.setDataSerializer('json');

        return this.http.put(url, body, {});
    }


}