import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subject, of } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { BRA_BranchProvider, CRM_ContactProvider, PR_ProgramConditionProvider, PR_ProgramItemProvider, PR_ProgramPartnerProvider, WMS_ItemGroupProvider, WMS_ItemProvider } from 'src/app/services/static/services.service';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss'],
})
export class ConditionComponent extends PageBase{
  ConditionForm;
  Condition;
  AttributeOption = [];
  OperatorOptionString;
  OperatorOptionSelect;
  OperatorOptionBool;
  Count = 0;
  Data = [];
  constructor(
    public pageProvider: PR_ProgramConditionProvider,
    public programPartnerProvider: PR_ProgramPartnerProvider,
    public programItemProvider: PR_ProgramItemProvider,
    public itemProvider: WMS_ItemProvider, 
    public itemGroupProvider: WMS_ItemGroupProvider, 
    public contactProvider: CRM_ContactProvider, 
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
    this.ConditionForm = this.formBuilder.array([]);
    this.formGroup = formBuilder.group({
      ConditionForm:this.ConditionForm
    });
  }
  loadData(event?: any): void {
    
    Object.assign(this.query, {Type:this.Condition.Type,IDProgram:this.Condition.IDProgram});
    if(this.Condition.IDParent){
      Object.assign(this.query, {IDParent:this.Condition.IDParent});
    }
    super.loadData();
    // this.env.getStatus('PaymentStatus').then(data => {this.statusList = data});
    // this.env.getType('PaymentType').then(data=>{this.typeList = data;});  
  }
  loadedData(event?): void {
    super.loadedData();
    if(this.Condition.Type == "ITEM"){
      this.env.getType('PRItemCondition').then(data=>{this.AttributeOption = data});
    }
    if(this.Condition.Type == "CONTACT"){
      this.env.getType('PRBusinessPartnerCondition').then(data=>{this.AttributeOption = data});
    }
    if(this.Condition.Type == "REWARD"){
      this.env.getType('PRRewardCondition').then(data=>{this.AttributeOption = data});
    }
    this.OperatorOptionString = [
      {Id:"eq",Name:"Bằng với"},
      {Id:"ne",Name:"Khác với"},
      {Id:" ",Name:"Chứa"},
    ];
    this.OperatorOptionSelect = [
      {Id:" ",Name:"Bằng với"},
      {Id:"ne",Name:"Khác với"},
    ];
    this.OperatorOptionBool = [
      {Id:" ",Name:"Là"},
    ];
    this.pathValueCondition();
    this.countData();
  }
  pathValueCondition(){
    this.items.forEach(i=>{
      let OperatorOption;
      if(i.Remark == "string"){
        OperatorOption = this.OperatorOptionString;
      }
      if(i.Remark == "select"){
        OperatorOption = this.OperatorOptionSelect;
      }
      if(i.Remark == "bool"){
        OperatorOption = this.OperatorOptionBool;
        if(i.Value == "False"){
          i.Value = false
        }
        if(i.Value == "True"){
          i.Value = true;
        }
      }
      let searchInput$ = new Subject<string>();
      let group = this.formBuilder.group({ 
        Id: [i.Id],
        IDProgram:[i.IDProgram],
        IDParent:[i.IDParent],
        Attribute: [i.Attribute,Validators.required],
        Type:[i.Type],
        Operator: [i.Operator,Validators.required],     
        Amount:[i.Amount],       
        Value:[i.Value,Validators.required],  
        Remark:[i.Remark],
        _OperatorOption: [OperatorOption],
        _ItemSearchLoading: [false],
        _ItemSearchInput: [searchInput$],
        _ItemDataSource: [searchInput$.pipe(distinctUntilChanged(),
                  tap(() => group.controls._ItemSearchLoading.setValue(true)),
                  switchMap(term => this.itemGroupProvider.search({ Take: 20, Skip: 0, Keyword: term})
                      .pipe(catchError(() => of([])), tap(() => group.controls._ItemSearchLoading.setValue(false))))
              )],
      }); 
      this.ConditionForm.push(group);
    })
  }
  addConditionForm(IDParent = null, level = 0) {
    if(this.Condition.IDParent){
      IDParent =  this.Condition.IDParent
    }
    let searchInput$ = new Subject<string>();
    let group = this.formBuilder.group({ 
      Id: [''],
      IDProgram:[this.Condition.IDProgram],
      IDParent:[IDParent],
      Attribute: [null,Validators.required],
      Type:[this.Condition.Type],
      Operator: [null,Validators.required],     
      Amount:[0],       
      Value:['',Validators.required], 
      Remark:['string'],  
      _OperatorOption: [this.OperatorOptionString],
      _ItemSearchLoading: [false],
      _ItemSearchInput: [searchInput$],
      _ItemDataSource: [searchInput$.pipe(distinctUntilChanged(),
                tap(() => group.controls._ItemSearchLoading.setValue(true)),
                switchMap(term => this.itemGroupProvider.search({ Take: 20, Skip: 0, Keyword: term})
                    .pipe(catchError(() => of([])), tap(() => group.controls._ItemSearchLoading.setValue(false))))
            )],
    }); 
    this.ConditionForm.push(group);
  }
  removeConditionForm(i: number, form:FormGroup): void {
    
    let Id = form.controls.Id.value;
    if(Id){ 
      if(this.pageConfig.canDelete){
        this.deleteItem(i);    
        this.items.splice(i, 1);   
        this.countData();    
      }
      else{
        this.env.showTranslateMessage('Bạn không có quyền xóa','warning');
      }
    }
    else{
      this.ConditionForm.removeAt(i);
    }
   
  }
  changeAttributeOption(form : FormGroup){
    let option = this.AttributeOption.find(o=>o.Code == form.controls.Attribute.value);
    form.controls.Remark.patchValue(option.Remark);
    form.controls.Remark.markAsDirty();
    if(option.Remark =="string"){
      form.controls._OperatorOption.setValue(this.OperatorOptionString);
    }
    if(option.Remark =="select"){
      form.controls._OperatorOption.setValue(this.OperatorOptionSelect);
      form.controls.Operator.setValue(" ");
      form.controls.Operator.markAsDirty();
    }
    if(option.Remark =="bool"){
      form.controls._OperatorOption.setValue(this.OperatorOptionBool);
      form.controls.Value.setValue(true);
      form.controls.Value.markAsDirty();
    }
    this.saveItemChange(form);
  }
  saveItemChange(form : FormGroup) {
    return new Promise((resolve, reject) => {
      form.updateValueAndValidity();
        if (!form.valid) {
            this.env.showTranslateMessage('erp.app.app-component.page-bage.check-red-above','warning');
        }
        else if (this.submitAttempt == false) {
            this.submitAttempt = true;
            this.item = {};     
            Object.assign(this.item, form.value);
            this.item.Value = this.item.Value.toString();
            this.item._ItemSearchInput = null;
            this.item._ItemDataSource = null;

            Object.keys(this.item).forEach(k => {
                if (this.item[k] === null || this.item[k] === undefined || this.item[k] === '')
                    delete this.item[k];
            });
            if (!this.item.hasOwnProperty('Id')) {
                this.item.Id = 0;
            }
            if (!this.item.hasOwnProperty('IsDisabled')) {
                this.item.IsDisabled = false;
            }
            if (!this.item.IDBranch) {
                this.item.IDBranch = this.env.selectedBranch;
            }           
            this.pageProvider.save(this.item, this.pageConfig.isForceCreate).then((savedItem: any) => {
                this.env.showTranslateMessage('erp.app.app-component.page-bage.save-complete','success'); 
                form.controls.Id.patchValue(savedItem.Id);        
                resolve(savedItem.Id);    
                if(this.item.Id == 0){
                  this.items.push(savedItem);   
                }
                else{              
                  let index = this.items.findIndex(i=>i.Id == this.item.Id);
                  this.items[index] = savedItem;
                }
                this.countData();                
                this.submitAttempt = false;
                
            }).catch(err => {          
                this.env.showTranslateMessage('erp.app.app-component.page-bage.can-not-save','danger');
                this.submitAttempt = false;
                reject(err);
            });
        }
    });
  } 
  deleteItem(i) {
    if (this.pageConfig.canDelete) {
        this.selectedItems.push(this.items[i]); 
        this.env.showPrompt('Bạn chắc muốn xóa ' + this.selectedItems.length + ' đang chọn?', null, 'Xóa ' + this.selectedItems.length + ' dòng').then(_=>{
           
          this.env.showLoading('Xin vui lòng chờ trong giây lát...', this.pageProvider.delete(this.selectedItems))
            .then(_ => {
                this.selectedItems=[];         
                this.ConditionForm.removeAt(i);
                this.env.showTranslateMessage('erp.app.app-component.page-bage.delete-complete','success');                                                   
            }).catch(err => {
                this.env.showMessage('Không xóa được, xin vui lòng kiểm tra lại.');
                console.log(err);
            });
        }).catch(_=>{
          this.selectedItems=[];
        });
    }
  }
  private countData() {
    if(this.items.length > 0){
      let pathapi = "ListItem";
      if(this.Condition.Type =="CONTACT"){
        pathapi = "ListContact";
      }
      this.requestData(pathapi);
    }  
  }
  setQuery():any{
    let query:any = {};
    this.items.forEach((i:any)=>{
      if(i.Type != "REWARD"){
        let Attribute = i.Attribute;
        let option = this.AttributeOption.find(o=>o.Code == i.Attribute);
        let value = i.Value;
       
       
        if(i.Operator!=" "){
          Attribute = Attribute+"_"+i.Operator;
        }
        query[Attribute.toString()] = i.Value;
      }
      
    });
    return query;
  }
  async applyData(){
    if(this.items.length > 0){
      let pathapi = "ApplyItem";
      if(this.Condition.Type =="CONTACT"){
        pathapi = "ApplyContact";
      }
      let apiPath = { method: "POST", url: function(){return ApiSetting.apiDomain("PR/ProgramCondition/"+pathapi)}};
      let request = {
        IDProgram: this.Condition.IDProgram,
        Ids:this.Data.map(s=>s.Id),
      }
      this.commonService.connect(apiPath.method, apiPath.url(),request).toPromise()
      .then((result:any)=>{console.log(result)})
      .catch(err=>{console.log(err)})
    }  
    return this.modalController.dismiss(this.Data,this.Condition.Type);
  }
  requestData(pathapi){
      if(this.Condition.Type !="REWARD"){
        let apiPath = { method: "GET", url: function(){return ApiSetting.apiDomain("PR/ProgramCondition/"+pathapi)}};
        let query = this.setQuery();
        this.commonService.connect(apiPath.method, apiPath.url(),query).toPromise()
        .then((result:any)=>{
          this.Count = result.length;
          this.Data = result;
        })
        .catch(err=>{console.log(err)})
      }
  }
}
