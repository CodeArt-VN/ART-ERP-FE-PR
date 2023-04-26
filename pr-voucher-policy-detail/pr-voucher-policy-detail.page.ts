import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { ConditionComponent } from '../condition/condition.component';

@Component({
  selector: 'app-pr-voucher-policy-detail',
  templateUrl: './pr-voucher-policy-detail.page.html',
  styleUrls: ['./pr-voucher-policy-detail.page.scss'],
})
export class PRVoucherPolicyDetailPage extends PageBase {
  Discounts=[];
  Bonus=[];
  ListItem = [];
  ListContact = [];

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
          Name:['',Validators.required],
          Code:['',Validators.required],
          Type:new FormControl({ value: '', disabled: true }),
          Status:new FormControl({ value: '', disabled: true }),
          FromDate: ['',Validators.required],
          ToDate: ['',Validators.required],
          IsPublic: [false],
          IsAutoApply: [false],
          IsApplyAllProduct: [false],
          IsApplyAllCustomer: [false],
          MinOrderValue: [10000],
          IsByPercent: [false],
          MaxValue:[0,Validators.required],
          Value:['',Validators.required],
          NumberOfCoupon:['',Validators.required],
          MaxUsagePerCustomer:[''],
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
      }else{
        this.formGroup.controls.Status.setValue('New');
        this.formGroup.controls.Type.setValue('Voucher');
      }
      super.loadedData();
    }
    async condition(Type:string) {
      if(this.id == 0){
        this.env.showMessage("Vui lòng nhập thông tin phía trên","warning");
        return false;
      }
      let title = "";
      if(Type=="ITEM"){
        title = "Sản phẩm áp dụng";
      }else if(Type=="CONTACT"){
        title = "Khách hàng áp dụng";
      }
      const modal = await this.modalController.create({
          component: ConditionComponent,
          swipeToClose: true,
          backdropDismiss: true,
          cssClass: 'modal-change-table',
          componentProps: {
            Condition:{
              Type:Type,
              Title:title,    
              IDProgram:this.item.Id, 
              TypeProgram: "Voucher",          
            }
          }
      });
      await modal.present();
      const { data, role} = await modal.onWillDismiss();
      if(role == "ITEM"){
        this.ListItem = data;
      }
      else if(role == "CONTACT"){
        this.ListContact = data;
      }
      
      
    }
    async saveChange(){
      if (!this.item?.Id){        
        this.formGroup.controls.Status.markAsDirty();       
        this.formGroup.controls.Type.markAsDirty();
      }
      if (this.formGroup.valid) {
        super.saveChange2();
      }
    }
    generateCodeVoucher(){
      let code = lib.generateUID();
      this.formGroup.controls.Code.patchValue(code);
      this.saveChange();
    }
}