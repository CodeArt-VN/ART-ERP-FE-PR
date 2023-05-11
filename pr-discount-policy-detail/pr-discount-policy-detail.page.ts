import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramConditionProvider, PR_ProgramItemProvider, PR_ProgramPartnerProvider, PR_ProgramProvider, PR_ProgramRewardProvider, WMS_ItemProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { ConditionComponent } from '../condition/condition.component';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { Subject, concat, of } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-pr-discount-policy-detail',
  templateUrl: './pr-discount-policy-detail.page.html',
  styleUrls: ['./pr-discount-policy-detail.page.scss'],
})
export class PRDiscountPolicyDetailPage extends PageBase {
  ConditionReward = [];
  NumberPartner = 0;
  NumberItem = 0;
  TypeReward; 
  constructor(
    public pageProvider: PR_ProgramProvider,
    public programPartnerProvider: PR_ProgramPartnerProvider,
    public programItemProvider: PR_ProgramItemProvider,
    public programConditionProvider: PR_ProgramConditionProvider,
    public programRewardProvider: PR_ProgramRewardProvider,
    public branchProvider: BRA_BranchProvider,
    public itemProvider: WMS_ItemProvider,
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
          Code:[''],
          Remark:[''],
          Type:new FormControl({ value: '', disabled: true }),
          Status:new FormControl({ value: '', disabled: true }),
          FromDate: ['',Validators.required],
          ToDate: ['',Validators.required],
          IsPublic: [false],
          IsAutoApply: [false],
          IsApplyAllProduct: [false],
          IsApplyAllCustomer: [false],
          MinOrderValue: [''],
          IsByPercent: [false],
          MaxValue:[''],
          Value:[''],
          NumberOfCoupon:[''],
          MaxUsagePerCustomer:[''],
          IsDiscount:[false],
          IsItemPromotion:[false],
          IsDisabled:[false],
          IsDeleted:[false],
          
        });      
        this.pageConfig.isDetailPage = true;
    }
    loadedData(event) {
      this.TypeReward = [      
        {Id:"PromotionItems",Name:"Tặng kèm SP"},
        {Id:"PercentDiscount",Name:"Giảm theo %"},
        {Id:"AmountDiscount",Name:"Giảm theo số tiền"},
      ]
      if (this.item?.Id) {
        
        this.item.FromDate = lib.dateFormat(this.item.FromDate, 'yyyy-mm-dd');
        this.item.ToDate = lib.dateFormat(this.item.ToDate, 'yyyy-mm-dd');
        this.countPartner(this.item.Id);
        this.countItem(this.item.Id);
        this.programConditionProvider.read({IDProgram:this.item.Id,Type:"REWARD", IDParent:null}).then(result=>{
          
          this.ConditionReward = result['data'];
          
          this.ConditionReward.forEach(c=>{
            if(c.Rewards.length > 0){
              c.Rewards.forEach(r=>{
                let searchInput$ = new Subject<string>();
                let itemListSelected = [];
                this.itemProvider.search({ Id : r.IDItem, AllUoM: true}).subscribe(result=>{           
                  if (result) {
                      r.ChooseIsRewardByOrder = true;
                      r.ChooseItem = false;
                      r.ChooseItemUoM = false;
                      r.ChooseQuantity = false;
                      r.ChooseAmount = false;
                      r.ChoosePercent = false;
                      r.ChooseMaxValue = false;
                      if(r.Type == "PromotionItems"){
                        r.ChooseIsRewardByOrder = false;
                        r.ChooseItem = true;
                        r.ChooseItemUoM = true;
                        r.ChooseQuantity = true;
                      }
                      if(r.Type == "PercentDiscount"){
                        if(r.IsRewardByOrder == false){
                          r.ChooseItem =true;
                          r.ChooseItemUoM =true;
                        }
                        r.ChoosePercent = true;
                        r.ChooseMaxValue = true;
                      }
                      if(r.Type == "AmountDiscount"){
                        if(r.IsRewardByOrder == false){
                          r.ChooseItem =true;
                          r.ChooseItemUoM =true;
                        }
                        r.ChooseAmount = true;
                      }
                      itemListSelected.push(result[0]);
                      itemListSelected = [...itemListSelected];   
                      r._UoMs = result[0].UoMs; 
                      r._ItemSearchLoading = false,
                      r._ItemSearchInput = searchInput$,
                      r._ItemDataSource = concat(of(itemListSelected),
                        searchInput$.pipe(distinctUntilChanged(),
                              tap(() => r._ItemSearchLoading = true),
                              switchMap(term  => this.itemProvider.search({ Take: 20, Skip: 0, Keyword: term})
                                  .pipe(catchError(() => of([])), tap(() => r._ItemSearchLoading = false)))
                        )
                      )
                  }
                })      
                
                
              })
            }
          })
          
        });
        if(this.item.Status != 'New'){
          this.formGroup.disable();
        }
        
      }else{
        this.formGroup.controls.Status.setValue('New');
        this.formGroup.controls.Type.setValue('Discount');
      }
      super.loadedData();
    }
    async condition(Type:string,IDParent = null , NameLevel = null) {
      if(this.id == 0){
        this.env.showMessage("Vui lòng nhập thông tin phía trên","warning");
        return false;
      }
      let title = "";
      if(Type=="ITEM"){
        title = "Sản phẩm áp dụng";
      }else if(Type=="CONTACT"){
        title = "Khách hàng áp dụng";
      }else if(Type=="REWARD"){
        title = "Điều kiện áp dụng " + NameLevel;
      }
      const modal = await this.modalController.create({
          component: ConditionComponent,
          canDismiss: true,
          backdropDismiss: true,
          cssClass: 'modal-change-table',
          componentProps: {
            Condition:{
              Type:Type,
              Title:title,    
              IDProgram:this.item.Id, 
              TypeProgram: "Discount",
              IDParent:IDParent
            }
          }
      });
      await modal.present();
      const { data, role} = await modal.onWillDismiss();
      if(role == "ITEM"){
        this.NumberItem = data.length;
      }
      else if(role == "CONTACT"){
        this.NumberPartner = data.length;
      }
      
      
    }
    async saveChange(){
      if (!this.item?.Id){        
        this.formGroup.controls.Status.markAsDirty();       
        this.formGroup.controls.Type.markAsDirty();
      }
      if(this.formGroup.controls.IsByPercent.value == true && this.formGroup.controls.Value.value > 99){
        this.formGroup.controls.Value.patchValue(0);   
        this.formGroup.controls.Value.markAsDirty();    
      }      
      if (this.formGroup.valid) {
        super.saveChange2();
      }
    }
    generateCodeVoucher(){
      let code = lib.generateUID();
      this.formGroup.controls.Code.patchValue(code);
      this.formGroup.controls.Code.markAsDirty();  
      this.saveChange();
    }
    addLevelDiscount(event){
      if(event.target.value==""){
        this.env.showTranslateMessage('vui lòng nhập tên hạn mức','danger');
        return false;
      }
      let condition = {
        IDProgram:this.item.Id,
        IDParent:null,
        Name:event.target.value,
        IsDisabled:false,
        IsDeleted:false,
        Type:"REWARD",
        Attribute:"",
        Operator:"",
        Amount:0,
      }
      this.programConditionProvider.save(condition).then(result=>{
        this.ConditionReward.push(result);
        event.target.value = null;
      });
    }
    updateLevelDiscount(c){
      if(c.Name==""){
        this.env.showTranslateMessage('vui lòng nhập tên hạn mức','danger');
        return false;
      }
      let condition = {
        Id:c.Id,
        Name:c.Name
      }
      this.programConditionProvider.save(condition).then(result=>{
        this.env.showTranslateMessage('erp.app.app-component.page-bage.save-complete','success');
      });
    }
    removeLevel(i,c){
      this.programConditionProvider.delete(c);
      this.ConditionReward.splice(i,1);
    }
    countPartner(id){
      let apiPath = { method: "GET", url: function(id){return ApiSetting.apiDomain("PR/Program/CountPartner/") + id}};
      this.commonService.connect(apiPath.method, apiPath.url(id),null).toPromise()
      .then((result:any)=>{
        this.NumberPartner = result;
      })
      .catch(err=>{console.log(err)})
    }
    countItem(id){
      let apiPath = { method: "GET", url: function(id){return ApiSetting.apiDomain("PR/Program/CountItem/") + id}};
      this.commonService.connect(apiPath.method, apiPath.url(id),null).toPromise()
      .then((result:any)=>{
        this.NumberItem = result;
      })
      .catch(err=>{console.log(err)})
    }
    addReward(i){
      if(!this.ConditionReward[i].Rewards){
        this.ConditionReward[i].Rewards = [];
      }
      let searchInput$ = new Subject<string>();
      let reward = {
        Id:0,
        IDCondition:this.ConditionReward[i].Id,
        Type: null,
        IDItem:null,
        IDItemUoM:null,
        PromotionQuantity:0,
        DiscountAmount:0,
        DiscountPercent:0,   
        MaxAmount:0,
        ChooseIsRewardByOrder:true,
        ChooseItem:false,
        ChooseItemUoM:false,
        ChooseQuantity:false,
        ChooseAmount:false,
        ChoosePercent:false,
        ChooseMaxValue:false,
        IsRewardByOrder:false,
        _UoMs: [], 
        _ItemSearchLoading: false,
        _ItemSearchInput: searchInput$,
        _ItemDataSource: searchInput$.pipe(distinctUntilChanged(),
                tap(() => reward._ItemSearchLoading = true),
                switchMap(term => this.itemProvider.search({ Take: 20, Skip: 0, Keyword: term})
                    .pipe(catchError(() => of([])), tap(() => reward._ItemSearchLoading = false)))
        ),
      }
      this.ConditionReward[i].Rewards.push(reward);
    }
    changedIDItem( i,j,e, submit = false) {
      
      if (e) {
        this.ConditionReward[i].Rewards[j]._UoMs = e.UoMs;
        this.ConditionReward[i].Rewards[j].IDItemUoM = null;
        this.changedIDUoM(e, submit);
      }
    }
    changedIDUoM(e, submit) {
      
    }
    saveReward(r){
      if(r.Type == null){
        this.env.showTranslateMessage('vui lòng nhập đầy đủ thông tin','danger');
        return false;
      }
      if(r.Type == "PromotionItems"){
        if(r.IDItem == null || r.IDItemUoM == null || r.PromotionQuantity == 0){
          this.env.showTranslateMessage('vui lòng nhập đầy đủ thông tin','danger');
          return false;
        }
      }
      if(r.Type == "PercentDiscount"){
        if(r.IsRewardByOrder == false){
          if(r.IDItem == null || r.IDItemUoM == null){
            this.env.showTranslateMessage('vui lòng nhập đầy đủ thông tin','danger');
            return false;
          }
        }       
        if(r.DiscountPercent <= 0 || r.MaxAmount <=0){
            this.env.showTranslateMessage('vui lòng nhập đầy đủ thông tin','danger');
            return false;
        } 
      }
      if(r.Type == "AmountDiscount"){
        if(r.IsRewardByOrder == false){
          if(r.IDItem == null || r.IDItemUoM == null){
            this.env.showTranslateMessage('vui lòng nhập đầy đủ thông tin','danger');
            return false;
          }
        }       
        if(r.DiscountAmount <= 0){
            this.env.showTranslateMessage('vui lòng nhập đầy đủ thông tin','danger');
            return false;
        } 
      }
      let reward = {
        Id:r.Id,
        IDCondition:r.IDCondition,
        Type: r.Type,
        IDItem:r.IDItem,
        IDItemUoM:r.IDItemUoM,
        PromotionQuantity:r.PromotionQuantity,
        DiscountAmount:r.DiscountAmount,
        DiscountPercent:r.DiscountPercent,   
        MaxAmount:r.MaxAmount,
        IsRewardByOrder:r.IsRewardByOrder,
      }
      this.programRewardProvider.save(reward).then(result=>{
        r.Id = result['Id'];
        this.env.showTranslateMessage('erp.app.app-component.page-bage.save-complete','success');
      })
    }
    deleteReward(i,j,r){
      
      this.programRewardProvider.delete(r).then(result=>{
        this.ConditionReward[i].Rewards.splice(j,1);
      })
    }
    changeType(r){  
      if(r.Type == "PromotionItems"){
        r.ChooseItem =true;
        r.ChooseItemUoM =true;
        r.ChooseQuantity =true;
        r.ChooseAmount =false;
        r.ChoosePercent =false;
        r.ChooseMaxValue = false;
        r.ChooseIsRewardByOrder = false;
        r.IsRewardByOrder = false;
        r.DiscountPercent = 0;
        r.MaxAmount = 0;
        r.DiscountAmount = 0;
      }
      if(r.Type == "PercentDiscount"){
        if(r.IsRewardByOrder== false){
          r.ChooseItem =true;
          r.ChooseItemUoM =true;
        }
        r.PromotionQuantity = 0;
        r.ChooseQuantity =false;       
        r.ChooseAmount =false;
        r.ChoosePercent =true;
        r.ChooseMaxValue = true;
        r.ChooseIsRewardByOrder = true;
        r.DiscountAmount = 0;
      }
      if(r.Type == "AmountDiscount"){
        if(r.IsRewardByOrder== false){
          r.ChooseItem =true;
          r.ChooseItemUoM =true;
        }
        r.PromotionQuantity = 0;
        r.ChooseQuantity =false;        
        r.ChooseAmount = true;
        r.ChoosePercent =false;
        r.ChooseMaxValue = false;
        r.ChooseIsRewardByOrder = true;
        r.DiscountPercent = 0;
        r.MaxAmount = 0;
      }
    }
    changeByOrder(r){
      if(r.IsRewardByOrder == true){
        r.ChooseItem =false;
        r.ChooseItemUoM =false;
        r.IDItem =null;
        r.IDItemUoM =null;
        r.PromotionQuantity = 0;
      }
      else{
        r.ChooseItem =true;
        r.ChooseItemUoM =true;
      }
    }
}
