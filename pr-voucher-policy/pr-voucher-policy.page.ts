import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { PR_ProgramProvider } from 'src/app/services/static/services.service';

@Component({
  selector: 'app-pr-voucher-policy',
  templateUrl: './pr-voucher-policy.page.html',
  styleUrls: ['./pr-voucher-policy.page.scss'],
})
export class PRVoucherPolicyPage extends PageBase {

  constructor( 
    public pageProvider: PR_ProgramProvider,
    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController
    ) {
        super(); 
        Object.assign(this.query, {Type:"Voucher"});       
    }
    changeStatus(Status) {
      let text = "Gửi Duyệt";
      let message = 'Sau khi gửi duyệt, bạn không thể chỉnh sửa đối tượng được nữa. Bạn chắc muốn gửi duyệt tất cả đối tượng chưa duyệt?'
      if(Status == 'Rejected'){
        text = "Không Duyệt";
        message = 'Bạn có chắc chắn không duyệt các đối tượng này?'
      }
      if(Status == 'Approved'){
        text = "Duyệt";
        message = 'Bạn có chắc chắn duyệt các đối tượng này?'
      }
      this.alertCtrl.create({
          header: text,
          //subHeader: '---',
          message: message,
          buttons: [
              {
                  text: 'Hủy',
                  role: 'cancel',
                  handler: () => {
                      //console.log('Không xóa');
                  }
              },
              {
                  text: 'Xác nhận',
                  cssClass: 'danger-btn',
                  handler: () => {
  
                      let publishEventCode = this.pageConfig.pageName;
                      let apiPath = {
                          method: "POST",
                          url: function () { return ApiSetting.apiDomain("PR/Program/ChangeStatus/") }
                      };
  
                      if (this.submitAttempt == false) {
                          this.submitAttempt = true;
                          let postDTO = {Ids:this.selectedItems.map(e => e.Id) , Status:Status};
                          this.pageProvider.commonService.connect(apiPath.method, apiPath.url(), postDTO).toPromise()
                              .then((savedItem: any) => {
                                  if (publishEventCode) {
                                      this.env.publishEvent({ Code: publishEventCode });
                                  }
                                  this.env.showTranslateMessage('erp.app.pages.sale.sale-order.message.save-complete','success');
                                  this.submitAttempt = false;
  
                              }).catch(err => {
                                  this.submitAttempt = false;
                                  //console.log(err);
                              });
                      }
  
                  }
              }
          ]
      }).then(alert => {
          alert.present();
      })
  
    }
}
