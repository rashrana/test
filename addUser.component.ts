import { Component, ViewContainerRef, OnInit } from '@angular/core';
import { AddUserService } from './addUser.component.service';
import { sessionService } from '../common/services/sessionService.component.service';
import { LoaderPaginationService } from '../common/services/loaderService';
import {HttpClient} from '@angular/common/http';
import {ToastrManager} from 'ng6-toastr-notifications';
import { constantNumber } from 'app/common/Constants/globalConstants';
@Component({
    selector: 'addUser',
    templateUrl: './addUser.html',
    providers: [AddUserService]
})
export class AddUserComponent {
    user: Object;
    productList:any;
    showMappedFeature:Array<Object>;
    ipAddress:any;
    imdCodeField : boolean = true;
    productsdropdownSettings = {};
    productsList : Array<String>;
    showMappedRoles:any = [];

    constructor(private _loaderService: LoaderPaginationService, private _addUser: AddUserService, private toastr: ToastrManager, private _vcr: ViewContainerRef, private _sessionService: sessionService,
    private http: HttpClient) {
        this._sessionService.checkSessionValidity();
        this.user = {
            productCode: ""
        };
        //this.getUserIP(function(ip:any)
        this.http.get<{ip:string}>('https://jsonip.com')
        .subscribe( data => {
            this.ipAddress = data.ip;
        })
        this.productsList = [];
        this.user['productCode'] = this.productsList;
    }
    getProduct() {
        this._loaderService.display(true);
        this._addUser.getAllProduct().subscribe(data => {
            this.productList = data
            this._loaderService.display(false);
        },error =>{
            this._loaderService.display(false);
            this.toastr.errorToastr("", "Not able to get products");
        });
    }
    mappedProduct(code:string){
        for (let result of this.productList){
            if(result['productCode'] === code){
                var product = result['productValue'];
            }
        }
        return product;
    }

    addUser(obj: Object) {
       let fiveHundredThree: number = 503;
       let fiveHundredTwo: number = 502;
       let zero: number = 0;
       let fourHundredFour: number = 404;
        this.assignValue();
        this._loaderService.display(true);
        let ids = obj['productCode']
        let selectedIds: any = [];
        ids.forEach((element:any) => {
            selectedIds.push(element['productCode']);
        });
        obj['productCode'] = selectedIds;
        var mainObj = obj;
        
        if (this.productsList.indexOf("1002") > -1)  {
            var agentCode = mainObj['agentCode'];
            this._addUser.checkAccountNumber(agentCode).subscribe(data => {
                var dataToSend = data;
                var obj = {
                    "agentCode": dataToSend.agentNumber,
                    "creditLimit": dataToSend.collectionAmount,
                    "creditLimitLastUpdate": new Date(),
                    "customerAccountNumber": dataToSend.accountNumber
                }
                this._addUser.addAccountNumber(obj).subscribe(data => {
                    mainObj['productCode'] = this.productsList;
                    this.addAllUser(mainObj);
                }, error => {
                    this._loaderService.display(false);
                    this.toastr.errorToastr("", "Something went wrong");
                })
            }, (error: any) => {
                this._loaderService.display(false);
                 switch(error.status) {
                     case fiveHundredThree : 
                     this.toastr.errorToastr("", error.statusText);
                     break;

                     case fiveHundredTwo : 
                     this.toastr.errorToastr("", "Bad Gateway");
                     break;

                     case zero : 
                     this.toastr.errorToastr("", "CORS Error, Please install cors plugin");
                     break;

                     case fourHundredFour : 
                     this.toastr.errorToastr("", "No agent found for given agent Id");
                     break;

                     default:
                     this.toastr.errorToastr("", "Account Number not present for this IMD code");
                 }

                // if (error.status === 503) {
                //     this.toastr.errorToastr("", error.statusText);
                // } else if (error.status === 502) {
                //     this.toastr.errorToastr("", "Bad Gateway");
                // } else if (error.status === 0) {
                //     this.toastr.errorToastr("", "CORS Error, Please install cors plugin");
                // } else if (error.status === 404) {
                //     this.toastr.errorToastr("", "No agent found for given agent Id");
                // } else {
                //     this.toastr.errorToastr("", "Account Number not present for this IMD code");
                // }
            });
        } else {
            mainObj['productCode'] = this.productsList;
            this.addAllUser(mainObj);
        }
    }
    addAllUser(obj: Object) {
        let userId = sessionStorage.getItem('userId');
        obj['updatedUserId'] = Number(userId);
        obj['machineIp'] = this.ipAddress;
        this._addUser.addUserToServer(obj).subscribe(data => {
            this._loaderService.display(false);
            if (data=== 'User added') {
                this.toastr.successToastr("", data);
            } else if (data=== 'Already Exists') {
                this.toastr.successToastr("", data);
            }
        }, error => {
            this._loaderService.display(false);
            this.toastr.errorToastr("", "something went wrong");
        });
    }
    getFeatureMapped(){
        this._loaderService.display(true);
        var code = this.user['agentCode'] || "";
        var webUserCode = this.user['webUserId'] || "";
        this._addUser.getAllFeatureMapped(code,webUserCode).subscribe(data =>{
            this._loaderService.display(false);
            if(!data || data.length === 0){
                this.toastr.infoToastr("No Product Assigned");
            }
            this.showMappedFeature = data;
        },error =>{
            this._loaderService.display(false);
        });
    }
    deleteMappedFeature(obj:Object){
        let userId = sessionStorage.getItem('userId');
        if(!obj.hasOwnProperty('updatedUserId')){
            obj['updatedUserId'] = userId
        }
        if(!obj.hasOwnProperty('machineIp')){
            obj['machineIp'] = this.ipAddress;
        }
        this._loaderService.display(true);
        obj['isActive'] = false;
        this._addUser.deleteProduct(obj).subscribe(data =>{
            this.getFeatureMapped();
            this._loaderService.display(false);
            this.toastr.successToastr("","Successfully Deleted");
        },error =>{
            this._loaderService.display(false);
            this.toastr.errorToastr("","Something went wrong, cannot delete the product");
        });
    }
    ngOnInit(): void {
        this.getRoleByTeam();
        this.getProduct();
        this.user['hoUser'] = "false";
        this.productsdropdownSettings = {
            singleSelection: false,
            idField: 'productCode',
            textField: 'productValue',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            allowSearchFilter: true
        };
    }
    bypassIMDVal(hoUserSelect : any){
        this.imdCodeField = (hoUserSelect === "true") ? false : true
        // if  (hoUserSelect === "true"){
        //     this.imdCodeField = false;
        // }else{
        //     this.imdCodeField = true;
        // }        
    }
    assignValue(){
        if (this.user['hoUser'] === "true" || this.user['hoUser'] === true) {
            this.user['agentCode'] = this.user['webUserId'];
            this.user['hoUser'] = true;
        }else{
            this.user['hoUser'] = false;
        }
    }
    
    onItemSelect(item: any){
        this.productsList.push(item.productCode);
        this.user['productCode'] = this.productsList;
    }
    
    onSelectAll(items: any) {
        items.forEach((element: { productCode: String; }) => {
            if(this.productsList.indexOf(element.productCode) === -1){
                this.productsList.push(element.productCode);
            }
        });
        this.user['productCode'] = this.productsList;
    }

    onDeSelectAll(items:any){
        this.productsList = [];
        this.user['productCode'] = this.productsList;
    }
    onDeSelect(item:any){
        let pos = this.productsList.indexOf(item.productCode);
        if(pos > -1){
            this.productsList.splice(pos,1);
        }
        this.user['productCode'] = this.productsList;
    }

    selectedIndex: number = 0;
    zero: number = 0;
    one: number = 1;
    two: number = 2;
    tabIndexData: any = [this.zero, this.one, this.two];
    passingStatus($event: any) {
    const index = $event.index;
    if (index === this.tabIndexData[0]) {
      this.selectedIndex = 0;
    } else if (index === this.tabIndexData[1]) {
      this.selectedIndex = 1;
    }
  }
  
  roleName: string = '';
  userId: string = '';
  imdCode: string = '';
  hoUser: string = 'true';
  saveRoleValue1() {
    //let numberTen = '10';
    // if(this.hoUser === '') {
    //     this.toastr.warningToastr('Please select is Ho User');
    //     return;
    // }

    let roleNameOfId = '';
   this.roleTypes.forEach((x: any) => {
    if(x.roleId === parseInt(this.roleName)) {
     roleNameOfId = x.roleName;
    }
    });
    
    if(this.userId === '') {
       this.toastr.warningToastr('Please enter user Id');
       return;
    }
    if(roleNameOfId === 'Partner' && (this.imdCode === '' || this.imdCode === null)) {
      this.toastr.warningToastr('Please enter imdCode');
      return;
   }
   if(this.roleName === null || this.roleName === '') {
    this.toastr.warningToastr('Please select role to assign');
    return;
   }
   if(this.teamOfRoles === '') {
      this.toastr.warningToastr('Please select team');
      return;
   }

   this.hoUser = roleNameOfId === 'Partner' ? 'false' : 'true';
   
    let userId = sessionStorage.getItem('userId');
      let requestObj = {
        webUserId:this.userId,
        roleId: parseInt(this.roleName),
        imdCode: roleNameOfId === 'Partner' ? this.imdCode : this.userId,
        active:"true",
        createdUser : userId,
        lastModifiedUser : userId,
        hoUser : this.hoUser,
        machineIp : this.ipAddress,
        roleName: roleNameOfId
      }
      this._loaderService.display(true);
      this._addUser.addUserRole(requestObj).subscribe(
          data => {
            this._loaderService.display(false);
              if(data.status === this._addUser.statusTwoHundred) {
                this.toastr.successToastr('Role is mapped successfully');
              }     
          },
          error => {
            this._loaderService.display(false);
            if (error.status === this._addUser.statusThreeHundredTwo) {
                this.toastr.warningToastr('Role is already assigned');
              } else {
                this.toastr.errorToastr("", "something went wrong");
              }
          }
      );
  }

  clearDeleteValue() {
    this.roleName = "";
    this.userId = "";
    this.imdCode = "";
    this.hoUser = "";
    this.showMappedRoles = [];
  }

  showRoleName(roleId: any) {
    let roleNameOfId = '';
    this.roleTypes.forEach((x: any) => {
     if(x.roleId === roleId) {
      roleNameOfId = x.roleName;
     }
   });
   return roleNameOfId;
  }
  
  teamOfRoles: any = 'digitPlus';
  roleTypes: any;
  getRoleByTeam() {
    this._addUser.getDPRoleNames().subscribe((data: any) => {
      this.roleTypes = data;

    }, (error: any) => {

    });
  }

  fetchRoleMapped(){
      if(this.userId === '' || this.userId === null) {
        this.toastr.warningToastr('Please enter webUserId to search'); 
        return;
      }
      let webUserId = this.userId;
      this._loaderService.display(true);
      this._addUser.getMappedRole(webUserId).subscribe((roleData: any) => {
        //this.roleTypes = roleData;
        this._loaderService.display(false);
            if(!roleData || roleData.length === 0){
                this.toastr.infoToastr("No Role Assigned");
            }
            this.showMappedRoles = roleData;
  
      }, (error: any) => {
        this._loaderService.display(false);
      });
  }

  deleteMappedRole(mappedData: any){
      mappedData.active = false;
    this._addUser.deleteMappedRole(mappedData).subscribe((respData: any) => {
        
        this._loaderService.display(false);
        this.toastr.infoToastr("Role deleted successful");  
  
      }, (error: any) => {
        this._loaderService.display(false);
        this.toastr.warningToastr('something went wrong');
      });
  }
}
