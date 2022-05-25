import {Injectable} from '@angular/core';
import { Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { environment } from '../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { HttpHeaders, HttpParamsOptions } from '@angular/common/http';
import { CommonFunctionService } from 'app/common-function.service';
import { sessionService } from 'app/common/services/sessionService.component.service';

@Injectable()
export class AddUserService {
    serverAPIEndpoint = environment.serverOldApiEndPoint;
    serverAPI = environment.serverApiEndPoint;
    serverAPIEndPointDashboard: any = environment.serverAPIEndPointDashboard;
    authorization: any;
     statusTwoHundredOne: number = 201;
     statusTwoHundred: number = 200;
     statusFourHundred: number = 400;
     statusFiveHundred: number = 500;
     statusThreeHundredTwo: number = 302;
    constructor(private http: HttpClient, private commonFunctionServices: CommonFunctionService, public sessionServices: sessionService) {
        this.authorization = this.sessionServices.getUserDetail("uid");
    }

    addUserToServer(obj: Object) {
        let headers = new HttpHeaders();
        headers.append('Authorization', 'A6FDF7804316AE9F85730FD898901004');
        let options = {
            headers: headers
        };
        let url = this.serverAPIEndpoint + "CommonDataService/rest/AddWebUsersMultiProduct"
        return this.http.post(url, obj, {headers : headers, observe: 'response', responseType: 'text'})
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
    getAllProduct() {
        var roleName = sessionStorage.getItem('roleName');
        let headers = new HttpHeaders();
        headers.append('Authorization', 'A6FDF7804316AE9F85730FD898901004');
        let options = {
            headers: headers
        };
        let url = this.serverAPIEndpoint + "CommonDataService/rest/product/info/" + roleName;
        return this.http.get(url, {headers : headers, observe: 'response'})
            .map((res: any) => {
                if (res) {
                    if (res.status === 201) {
                        return res.body
                    } else if (res.status === 200) {
                        return res.body;
                    }
                }
            }).catch((error: any) => {
                if (error.status < 400 || error.status === 500) {
                    return Observable.throw(new Error(error));
                }
            });
    }
    getAllFeatureMapped(agentCode: string, webUserCode: string) {
        let headers = new HttpHeaders();
        headers.append('Authorization', 'A6FDF7804316AE9F85730FD898901004');
        let options = {
            headers: headers
        };
        let url = this.serverAPIEndpoint + "CommonDataService/rest/GetWebUsers?agentCode=" + agentCode + '&webUserId=' + webUserCode
        return this.http.get(url, {headers : headers, observe: 'response'})
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
                    return Observable.throw(new Error(error));
                }
            });
    }
    checkAccountNumber(agentCode: any) {
        let url = this.serverAPI + "/float?agentCode=" + agentCode;
        return this.http.get(url, {observe: 'response'})
            .map((res: any) => {
                if (res) {
                    if (res.status === 201) {
                        return res.body
                    } else if (res.status === 200) {
                        return res.body;
                    }
                }
            }).catch((error: HttpErrorResponse) => {
                if (error.status <= 404 || error.status >= 500) {
                    return Observable.throw(error);
                }
            });
    }
    addAccountNumber(obj: Object) {
        let url = this.serverAPIEndpoint + "CommonDataService/rest/Agent/saveAgentCredits"
        return this.http.post(url, obj, {observe: 'response'})
            .map((res: any) => {
                if (res) {
                    if (res.status === 201) {
                        return res.body
                    } else if (res.status === 200) {
                        return res.body;
                    }
                }
            }).catch((error: HttpErrorResponse) => {
                if (error.status <= 400 || error.status >= 500) {
                    return Observable.throw(error);
                }
            });
    }
    deleteProduct(obj: Object) {
        let headers = new HttpHeaders();
        headers.append('Authorization', 'A6FDF7804316AE9F85730FD898901004');
        let options = {
            headers: headers
        };
        let url = this.serverAPIEndpoint + "CommonDataService/rest/removewebusers"
        return this.http.put(url, obj, {headers : headers, observe: 'response', responseType: 'text'})
            .map((res: any) => {
                if (res) {
                    if (res.status === 201) {
                        return res.body
                    } else if (res.status === 200) {
                        return res.body;
                    }
                }
            }).catch((error: HttpErrorResponse) => {
                if (error.status <= 400 || error.status >= 500) {
                    return Observable.throw(error);
                }
            });
    }

    addUserRole(obj: any) {
        let headers = new HttpHeaders();
        headers.append('Authorization', 'A6FDF7804316AE9F85730FD898901004');
        //let url = "https://uat-commondataservice.godigit.com/CommonDataService/rest/AddWebUsersMultiProductNew";
        let url = this.serverAPIEndpoint + "CommonDataService/rest/AddWebUsersMultiProductNew"
        return this.http.post(url, obj, {headers: headers, observe: 'response'})
            .map((res: any) => {
                if (res) {
                    if (res.status === this.statusTwoHundredOne) {
                        return res.body;
                    } else if (res.status === this.statusTwoHundred) {
                        return res.body;
                    }
                }
            }).catch((error: HttpErrorResponse) => {
                if (error.status <= this.statusFourHundred || error.status >= this.statusFiveHundred) {
                    return Observable.throw(error);
                }
            });
    }

    getRoleByTeam(roleType: any) {
        let url = this.serverAPIEndPointDashboard + "/userNameOrRoleNamesByRoleType?roleType=" + roleType;
        let response = this.commonFunctionServices._serviceCall(url, "get", this.authorization);
        return response
      }

      getDPRoleNames() {
        let url = this.serverAPIEndpoint + "CommonDataService/rest/fetchRoleNames";
        let response = this.commonFunctionServices._serviceCall(url, "get", this.authorization);
        return response
      }

      getMappedRole(userId: any) {
        let url = this.serverAPIEndpoint + "CommonDataService/rest/fetchUserRolesOnWebUserId?webUserId=" + userId;
        let response = this.commonFunctionServices._serviceCall(url, "get", this.authorization);
        return response
      }

      deleteMappedRole(obj: Object) {
        let headers = new HttpHeaders();
        headers.append('Authorization', 'A6FDF7804316AE9F85730FD898901004');
        let url = this.serverAPIEndpoint + "CommonDataService/rest/updateUserRoles"
        return this.http.post(url, obj, {headers: headers, observe: 'response'})
            .map((res: any) => {
                if (res) {
                    if (res.status === this.statusTwoHundredOne) {
                        return res.body;
                    } else if (res.status === this.statusTwoHundred) {
                        return res.body;
                    }
                }
            }).catch((error: HttpErrorResponse) => {
                if (error.status <= this.statusFourHundred || error.status >= this.statusFiveHundred) {
                    return Observable.throw(error);
                }
            });
    }
}