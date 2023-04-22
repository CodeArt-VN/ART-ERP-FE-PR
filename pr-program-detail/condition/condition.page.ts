import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { BRA_BranchProvider, CRM_ContactProvider, PR_ProgramConditionProvider, WMS_ItemProvider } from 'src/app/services/static/services.service';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.page.html',
  styleUrls: ['./condition.page.scss'],
})
export class ConditionPage extends PageBase{
  ConditionForm;
  Condition;
  AttributeOption;
  OperatorOption;
  Count = 0;
  Data = [];
  showData = false;
  constructor(
    public pageProvider: PR_ProgramConditionProvider, 
    public itemProvider: WMS_ItemProvider, 
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
    Object.assign(this.query, {Type:this.Condition.Type});
    super.loadData();
  }
  loadedData(event?): void {
    super.loadedData();
    if(this.Condition.Type == "ITEM"){
      this.AttributeOption = [
        {Id:"IDBranch",Name:"Chi nhánh",Type:"select"},
        {Id:"Name",Name:"Tên sản phẩm",Type:"string"},
        {Id:"Code",Name:"Mã sản phẩm",Type:"string"},
        {Id:"IDItemGroup",Name:"Nhóm sản phẩm",Type:"select"},     
      ]
    }
    else{
      this.AttributeOption = [
        {Id:"IDBranch",Name:"Chi nhánh",Type:"select"},
        {Id:"Name",Name:"Tên khách hàng",Type:"string"},
        {Id:"Code",Name:"Mã khách hàng",Type:"string"},
      ]
    }
    this.OperatorOption = [
      {Id:"eq",Name:"Bằng với"},
      {Id:"ne",Name:"Khác với"},
      {Id:" ",Name:"Chứa"},
    ];
    this.pathValueCondition();
    this.getData();
  }
  pathValueCondition(){
    this.items.forEach(i=>{
      let group = this.formBuilder.group({ 
        Id: [i.Id],
        IDProgram:[i.IDProgram],
        IDParent:[i.IDParent],
        Attribute: [i.Attribute,Validators.required],
        Type:[i.Type],
        Operator: [i.Operator,Validators.required],     
        Amount:[i.Amount],       
        Value:[i.Value,Validators.required],  
      }); 
      this.ConditionForm.push(group);
    })
  }
  addConditionForm(IDParent = null, level = 0) {
    let group = this.formBuilder.group({ 
      Id: [''],
      IDProgram:[this.Condition.IDProgram],
      IDParent:[''],
      Attribute: [null,Validators.required],
      Type:[this.Condition.Type],
      Operator: [null,Validators.required],     
      Amount:[0],       
      Value:['',Validators.required],  
    }); 
    this.ConditionForm.push(group);
  }
  removeConditionForm(i: number, form:FormGroup): void {
    
    let Id = form.controls.Id.value;
    if(Id){ 
        this.deleteItem(i);    
        this.items.splice(i, 1);   
        this.getData();         
    }
    else{
      this.ConditionForm.removeAt(i);
    }
   
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
                this.getData();                
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
  private getData() {
    if(this.items.length > 0){
      let query = this.pathQuery();
      if(this.Condition.Type == "ITEM"){
        this.itemProvider.read(query).then(result=>{
          this.Count = result['count'];
          this.Data = result['data'];
          console.log(this.Data);
        }).catch(err=>{
          console.log(err);
        })
      }
      else if(this.Condition.Type =="CONTACT") {
        this.contactProvider.read(query).then(result=>{
          this.Count = result['count'];
        }).catch(err=>{
          console.log(err);
        })
      }
    }
    
  }
  pathQuery():any{
    let query:any = {
      Take:100,
      Skip: 0,
    };
    this.items.forEach((i:any)=>{
      let Attribute = i.Attribute;
      let option = this.AttributeOption.find(o=>o.Id == i.Attribute);
      let value = i.Value;
      if(option.Type == "select"){
        value = parseInt(value);
      }
      if(i.Operator!=" "){
        Attribute = Attribute+"_"+i.Operator;
      }
      query[Attribute.toString()] = i.Value;
    });
    return query;
  }
}
