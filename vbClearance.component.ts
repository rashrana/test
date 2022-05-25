import { Component, ViewContainerRef } from '@angular/core';
import { LoaderPaginationService } from '../../common/services/loaderService';
import { sessionService } from '../../common/services/sessionService.component.service';
import { successFailureList, filterByList } from '../../common/Constants/globalConstants';
import { RequestABSService } from '../requestABS.service';
import { ABSRequestModel, ABSRequestStatus } from '../ABSRequestModel';
import { ToastrManager } from 'ng6-toastr-notifications';

export const POLICY_LENGTH = 10
export const HUNDRED = 100;
@Component({
    selector: 'vb-clearance',
    templateUrl: './vbClearance.component.html',
    providers: [RequestABSService]
})

export class VbClearanceComponent {
    policyNo: string
    statusValue: string = "";
    submitted: boolean = false;
    showProgress: boolean = false;
    showTable: boolean = false;
    rawPolicyList: string[];
    successMap: Map<string, string> = new Map<string, string>();
    progressValue: number = 0;
    presentprogressIndex: number = 0;
    selectAll: boolean = false;
    successFailureList: any = successFailureList;


    absRequestStatusList: ABSRequestStatus[] = [];
    absRequestStatusListPermanent: ABSRequestStatus[] = [];

    validation: string;

    constructor(
        private toastr: ToastrManager,
        private _vcr: ViewContainerRef,
        private _sessionService: sessionService,
        private requestABSService: RequestABSService
    ) {
    }

    ngOnInit() {
        this._sessionService.checkSessionValidity();
    }

    unlockPolicy(data: string) {
        this.submitted = true;
        this.showProgress = true;
        let count = 0;
        data.trim();
        if (data.length === POLICY_LENGTH) {
            this.rawPolicyList = new Array();
            this.rawPolicyList.push(data.trim());
            this.unlockPolicyServiceCall(count);
        } else {
            this.rawPolicyList = data.trim().split(',');

            this.rawPolicyList.forEach((str, index) => {
                if (str === "" || str === null) {
                    this.rawPolicyList.slice(index, 1);
                }
            });
            this.unlockPolicyServiceCall(count);
        }
    }

    unlockPolicyServiceCall(count: number) {
        if (count === 0) {
            this.progressValue = (count + 1) * HUNDRED / this.rawPolicyList.length;
            this.presentprogressIndex = count + 1;
        } else {
            this.progressValue = (count + 1) * HUNDRED / this.rawPolicyList.length;
            this.presentprogressIndex = count + 1;
        }

        if (count < this.rawPolicyList.length) {
            let unlockPolicyDetails: ABSRequestModel = new ABSRequestModel();

            unlockPolicyDetails.data = this.rawPolicyList[count].trim();
            unlockPolicyDetails.structureType = "S";
            unlockPolicyDetails.activityName = "BOKAP";
            unlockPolicyDetails.structureName = "UPDQOOR";

            try {
                this.requestABSService.sendUnlockPolicy(unlockPolicyDetails)
                    .subscribe(resp => {
                        let successCount = this.successMap.has("successCount") ? this.successMap.get("successCount") : 0;
                        this.successMap.has("success") ? this.successMap.set("success", this.successMap.get("success") + "," + this.rawPolicyList[count]) : this.successMap.set("success", this.rawPolicyList[count]);
                        this.successMap.set("successCount", (+successCount + 1).toString());

                        let contains = false;

                        this.absRequestStatusListPermanent.forEach(element => {
                            if (element.policyNumber === this.rawPolicyList[count]) {
                                contains = true;
                            }
                        });

                        if (!contains) {
                            let absRequestStatus: ABSRequestStatus = new ABSRequestStatus();
                            absRequestStatus.policyNumber = this.rawPolicyList[count];
                            absRequestStatus.status = "success";

                            this.absRequestStatusList.push(absRequestStatus);
                            this.absRequestStatusListPermanent.push(absRequestStatus);
                        } else {
                            this.absRequestStatusListPermanent.forEach(element => {
                                if (element.policyNumber === this.rawPolicyList[count]) {
                                    element.status = "success";
                                }
                            });
                        }
                        this.showTable = true;

                        if (count === this.rawPolicyList.length - 1) {
                            this.showProgress = false;
                            this.submitted = false;
                        }
                        this.unlockPolicyServiceCall(count + 1);
                    }, error => {
                        this.handleServiceCallError(count);
                    });
            } catch (e) {
                this.handleServiceCallError(count, e);
            }
        }
    }


    handleServiceCallError(count: number, error?: Error) {

        this.showTable = true;
        let errorCount = this.successMap.has("errorCount") ? this.successMap.get("errorCount") : 0;
        this.successMap.has("error") ? this.successMap.set("error", this.successMap.get("error") + "," + this.rawPolicyList[count]) : this.successMap.set("error", this.rawPolicyList[count]);

        this.successMap.set("errorCount", (+errorCount + 1).toString());

        if (count === this.rawPolicyList.length - 1) {
            this.showProgress = false;
            this.submitted = false;
        }

        let contains = false;

        this.absRequestStatusListPermanent.forEach(element => {
            if (element.policyNumber === this.rawPolicyList[count]) {
                contains = true;
            }
        });

        if (!contains) {
            let absRequestStatus: ABSRequestStatus = new ABSRequestStatus();
            absRequestStatus.policyNumber = this.rawPolicyList[count];
            absRequestStatus.status = "failure";

            this.absRequestStatusList.push(absRequestStatus);
            this.absRequestStatusListPermanent.push(absRequestStatus);
        }

        if (error !== undefined) {
            this.toastr.errorToastr("", "Invalid Policy Number for  " + this.rawPolicyList[count]);
            this.absRequestStatusList.slice()
        } else {
            this.toastr.errorToastr("", "Failed to Unlock Policy  " + this.rawPolicyList[count]);
        }
        this.unlockPolicyServiceCall(count + 1);
    }

    statusChanged(status: string) {
        switch(status) {
            case "success":
                this.absRequestStatusList.splice(0, this.absRequestStatusList.length);
                this.absRequestStatusListPermanent.forEach(element => {
                    if (element.status === "success") {
                        this.absRequestStatusList.push(element);
                    }
                });
              break;
            case "failure":
                this.absRequestStatusList.splice(0, this.absRequestStatusList.length);
                this.absRequestStatusListPermanent.forEach(element => {
                    if (element.status === "failure") {
                        this.absRequestStatusList.push(element);
                    }
                });
              break;
              default:
                this.absRequestStatusList.splice(0, this.absRequestStatusList.length);
                this.absRequestStatusListPermanent.forEach(element => {
                    this.absRequestStatusList.push(element);
                });
            }
      }

    enterClicked(event: Event) {
        event.preventDefault();
        let element = document.getElementById("unlockPolicySubmitId");
        element.click();
    }

    onPolicyChanged(data: String) {
        event.preventDefault();
        let policyList = this.policyNo.split(",");
        this.policyNo = '';
  policyList.forEach((str, index) => {
            this.policyNo = (index === 0) ? this.policyNo + str.trim() : this.policyNo + "," + str.trim();
        });
    }
}