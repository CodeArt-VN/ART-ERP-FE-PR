import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramProvider } from 'src/app/services/static/services.service';
import { ConditionPage } from './condition/condition.page';
import { lib } from 'src/app/services/static/global-functions';

@Component({
  selector: 'app-pr-program-detail',
  templateUrl: './pr-program-detail.page.html',
  styleUrls: ['./pr-program-detail.page.scss'],
})
export class PRProgramDetailPage extends PageBase {  
  constructor(
    public pageProvider: PR_ProgramProvider,
    public branchProvider: BRA_BranchProvider,
    public env: EnvService,
    public navCtrl: NavController,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loadingController: LoadingController,
    public commonService: CommonService,
    public modalController: ModalController,
    ) 
    {
        super();
        this.formGroup = formBuilder.group({
          Id: new FormControl({ value: '', disabled: true }),
          IDBranch:[this.env.selectedBranch],
          Name:[''],
          Type:[''],
          Status:[],
          FromDate: [''],
          ToDate: [''],
          IsPublic: [false],
          IsAutoApply: [false],
          IsApplyAllProduct: [false],
          IsApplyAllCustomer: [false],
          MinOrderValue: [0],
          IsByPercent: [false],
          MaxValue:[0],
          Value:[0],
          NumberOfCoupon:[0],
          MaxUsagePerCustomer:[0],
          IsDiscount:[false],
          IsItemPromotion:[false],
          IsDisabled:[false],
          IsDeleted:[false],
        });
        this.pageConfig.isDetailPage = true;
    }
    loadedData(event) {
      if (this.item?.Id) {
          this.item.FromDate = lib.dateFormat(this.item.FromDate, 'yyyy-mm-dd');
          this.item.ToDate = lib.dateFormat(this.item.ToDate, 'yyyy-mm-dd');
      }
      super.loadedData();
    }
    async condition(Type:string) {
      let title = "";
      if(Type=="ITEM"){
        title = "Sản phẩm áp dụng";
      }else if(Type=="CONTACT"){
        title = "Đối tượng áp dụng";
      }
      const modal = await this.modalController.create({
          component: ConditionPage,
          swipeToClose: true,
          backdropDismiss: true,
          cssClass: 'modal-change-table',
          componentProps: {
            Condition:{
              Type:Type,
              Title:title,    
              IDProgram:this.item.id,         
            }
          }
      });
      await modal.present();
      const { data , role } = await modal.onWillDismiss();
      
    }
}