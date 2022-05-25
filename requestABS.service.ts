import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { sessionService } from '../common/services/sessionService.component.service';
import { environment } from '../../environments/environment';
import { ABSRequestModel } from './ABSRequestModel';
import { Observable } from 'rxjs';

@Injectable()
export class RequestABSService {
    authorization: string;
    serverAPIEndpoint = environment.serverApiEndPoint

    constructor(
        private http: HttpClient, private _sessionService: sessionService
    ) {
        this.authorization = this._sessionService.getUserDetail("uid");
    }

    sendRIDRequest(data: ABSRequestModel) {

        let url = this.serverAPIEndpoint + "/requestABS";

        return this.http.post(url, data, {observe : 'response'})
            .map((res: any) => {
                if (res) {
                    if (res.status === 201) {
                        return res.body;
                    } else if (res.status === 200) {
                        return res.body;
                    }
                }
            }).catch((error: any) => {
                if (error.status < 400 || error.status === 500) {
                    return Observable.throw(new Error(error.status));
                }
            });
    }


    sendUnlockPolicy(model: ABSRequestModel) {

        let url = this.serverAPIEndpoint + "/requestABS";

        if (model.data.startsWith("D")
            && model.data.length === 10
            && !isNaN(+ model.data.substring(1, model.data.length))) {

            return this.http.post(url, model, {observe : 'response'})
                .map((res: any) => {
                    if (res) {
                        if (res.status === 201) {
                            return res.body;
                        } else if (res.status === 200) {
                            return res.body;
                        }
                    }
                }).catch((error: any) => {
                    if (error.status < 400 || error.status === 500) {
                        return Observable.throw(new Error(error.status));
                    }
                });
        } else {
            var sizeOfPolicyNumber = model.data.length;
            throw new Error("Invalid Policy Number " + model.data);
        }
    }



}