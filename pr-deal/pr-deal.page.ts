import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { BRA_BranchProvider, PR_DealProvider } from 'src/app/services/static/services.service';

@Component({
  selector: 'app-pr-deal',
  templateUrl: './pr-deal.page.html',
  styleUrls: ['./pr-deal.page.scss'],
  standalone: false,
})
export class PRDealPage extends PageBase {
  ShowDelete = false;
  ShowChangeBranch = false;
  ShowSubmit = false;
  ShowApprove = false;
  ShowDisapprove = false;
  statusList = [];
  constructor(
    public pageProvider: PR_DealProvider,
    public branchProvider: BRA_BranchProvider,
    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController,
  ) {
    super();
  }

  changeStatus(text, message, Status) {
    this.alertCtrl
      .create({
        header: text,
        //subHeader: '---',
        message: message,
        buttons: [
          {
            text: 'Hủy',
            role: 'cancel',
            handler: () => {
              //console.log('Không xóa');
            },
          },
          {
            text: 'Xác nhận',
            cssClass: 'danger-btn',
            handler: () => {
              let publishEventCode = this.pageConfig.pageName;
              let apiPath = {
                method: 'POST',
                url: function () {
                  return ApiSetting.apiDomain('PR/Deal/ChangeStatus/');
                },
              };

              if (this.submitAttempt == false) {
                this.submitAttempt = true;
                let postDTO = {
                  Ids: this.selectedItems.map((e) => e.Id),
                  Status: Status,
                };
                this.pageProvider.commonService
                  .connect(apiPath.method, apiPath.url(), postDTO)
                  .toPromise()
                  .then((savedItem: any) => {
                    if (publishEventCode) {
                      this.env.publishEvent({
                        Code: publishEventCode,
                      });
                    }
                    this.env.showMessage('Saving completed!', 'success');
                    this.submitAttempt = false;
                  })
                  .catch((err) => {
                    this.submitAttempt = false;
                    //console.log(err);
                  });
              }
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }

  submit(): void {
    let text = 'Gửi Duyệt';
    let message =
      'Sau khi gửi duyệt, bạn không thể chỉnh sửa đối tượng được nữa. Bạn có chắc muốn gửi duyệt tất cả đối tượng chưa duyệt?';
    this.changeStatus(text, message, 'Pending');
  }

  approve(): void {
    let text = 'Duyệt';
    let message = 'Bạn có chắc chắn duyệt các đối tượng này?';
    this.changeStatus(text, message, 'Approved');
  }

  disapprove(): void {
    let text = 'Không Duyệt';
    let message = 'Bạn có chắc chắn không duyệt các đối tượng này?';
    this.changeStatus(text, message, 'Rejected');
  }

  loadedData(event?: any, ignoredFromGroup?: boolean): void {
   

    super.loadedData();
    
    this.statusList = [{
      Code :'Approved',
      Name : 'Approved'
    },{
      Code : 'New',
      Name : 'New'
    },{
      Code : 'Pending',
      Name : 'Pending'
    }]
  }

  changeSelection(i: any, e?: any): void {
    this.ShowSubmit= this.pageConfig.canSubmit = this.pageConfig.canSubmitDealForApproval;
    this.ShowApprove = this.pageConfig.canApprove =  this.pageConfig.canApproveDeal;
    this.ShowDisapprove = this.pageConfig.canDisapprove = this.pageConfig.canDisapproveDeal;
    this.ShowDelete = this.pageConfig.canDelete;
    let notShowSubmit = ['Approved','Rejected','Cancelled','Submitted','Pending'];
    let notShowApprove = ['Approved','Rejected'];
    let notShowDisapprove = ['Disapprove','Rejected','Cancelled'];
    super.changeSelection(i, e);
    this.selectedItems.forEach(o => {
      if(notShowSubmit.includes(o.Status) ){
        this.ShowSubmit = false;
      }
      if(notShowApprove.includes(o.Status)){
        this.ShowApprove = false;
      }
      if(notShowDisapprove.includes(o.Status)){
        this.ShowDisapprove = false;
      }
    })

    if (this.selectedItems?.length == 0) {
      this.ShowSubmit = this.ShowApprove = this.ShowDisapprove = false;
    }
  
  }
}
