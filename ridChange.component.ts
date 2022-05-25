import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ABSRequestModel, ABSModel } from '../ABSRequestModel';
import * as moment from 'moment';
import { RequestABSService } from '../requestABS.service';
import { LoaderPaginationService } from '../../common/services/loaderService';
import { NgForm } from '@angular/forms';
import { sessionService } from './../../common/services/sessionService.component.service';
import {ToastrManager} from 'ng6-toastr-notifications';

@Component({
  selector: 'request-rid',
  templateUrl: './ridChange.component.html',
  providers: [RequestABSService]
})
export class RidChangeComponent implements OnInit {

  absRequestModel: ABSRequestModel = new ABSRequestModel();
  absModel: ABSModel = new ABSModel();

  constructor(private requestABSService: RequestABSService,
    private _loaderService: LoaderPaginationService,
    private toastr: ToastrManager, 
    private _sessionService: sessionService ,
    private _vcr : ViewContainerRef
  ) {
    this._sessionService.checkSessionValidity();
  }

  ngOnInit() {
  }

  requestRIDChange(absModel: ABSModel, requestRID: NgForm) {

    if (requestRID.form.invalid) {
      return;
    }

    this.absRequestModel.data = this.absModel.policyNumber.toUpperCase()
      + "|" + moment(this.absModel.newInception).format('YYYY-MM-DD')
      + "|" + moment(this.absModel.newExpiry).format('YYYY-MM-DD')
      + "|" + moment(this.absModel.oldInception).format('YYYY-MM-DD')
      + "|" + moment(this.absModel.oldExpiry).format('YYYY-MM-DD');

    this.absRequestModel.activityName = "REQRI";
    this.absRequestModel.structureName = "UPDQOOR";
    this.absRequestModel.structureType = "S";

    this._loaderService.display(true);

    this.requestABSService.sendRIDRequest(this.absRequestModel)
      .subscribe(data => {
        this._loaderService.display(false);
        this.toastr.successToastr("", "Successfully changed");
        requestRID.resetForm();
      }, error => {
        this._loaderService.display(false);
        this.toastr.errorToastr("", "Something Went Wrong");
      });
  }

  convertToCaps(){
   this.absModel.policyNumber =  this.absModel.policyNumber.toUpperCase();
  }

}
