import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NavController, AlertController, LoadingController, ModalController, ItemReorderEventDetail } from '@ionic/angular';
import { Schema } from 'src/app/models/options-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';


@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
})
export class FilterModalComponent  extends PageBase{
  ConditionForm;
  Condition;
  Operators;
  Count = 0;
  schemaDetailList;
  transformOperators;
  filter;
  Data = [];
  logicalOperators;
  connectionList=[];
 public  connectedto(form):any{
    return form.UniqueId
  }
  constructor(
    public env: EnvService,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public loadingController: LoadingController,
    public modalController: ModalController,
    private cdRef: ChangeDetectorRef
  ) 
  {
    super();
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
 }
  loadData(event?: any): void {
    this.filter = {
      Dimension:"logical",
      Operator: 'AND',
      Value: null,
      Logicals:[
        {Dimension:"logical", Operator:'AND',Value:null,Logicals:[
          {Dimension:"Code", Operator:'ends with',Value:"A"},
          {Dimension:"Name", Operator:'starts with',Value:"Ph"}
        ]},
        {Dimension:"Code", Operator:'starts with',Value:"P"}
      ],
    }
    var schemaList: Schema[] = [
      { Id: 1, Code: 'SaleOrder', Name: 'Sale orders', Type: 'Dataset', ModifiedDate: '2023-01-01' },
      { Id: 2, Code: 'ARInvoice', Name: 'A/R Invoice dataset', Type: 'Dataset', ModifiedDate: '2023-01-01' },
      { Id: 3, Code: 'ARInvoice', Name: 'A/R Invoice dataset', Type: 'Dataset', ModifiedDate: '2023-01-01' },
      { Id: 4, Code: 'ITEM', Name: 'Item PR', Type: 'Dataset', ModifiedDate: '2023-01-01' },
      { Id: 5, Code: 'CONTACT', Name: 'contact PR', Type: 'Dataset', ModifiedDate: '2023-01-01' },
      ];
    var schemaDetailList = [
        { IDSchema: 1, Id: 1, Code: 'logical', Name: 'logical', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 1, Id: 1, Code: 'OrderDate', Name: 'Ngày lên đơn', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 1, Id: 1, Code: 'Status', Name: 'Status', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 1, Id: 1, Code: 'Count', Name: 'Count of documents', Type: 'Number', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 1, Id: 1, Code: 'Total', Name: 'Sum of total', Type: 'Number', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 1, Id: 1, Code: 'Discount', Name: 'Sum of discount', Type: 'Number', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
      
        { IDSchema: 4, Id: 4, Code: 'logical', Name: 'logical', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 4, Id: 4, Code: 'Name', Name: 'Tên sản phẩm', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 4, Id: 4, Code: 'Code', Name: 'Mã sản phẩm', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 4, Id: 4, Code: 'IDItemGroup', Name: 'Nhóm sản phẩm', Type: 'Number', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },

        { IDSchema: 5, Id: 5, Code: 'logical', Name: 'logical', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 5, Id: 5, Code: 'Name', Name: 'Tên khách hàng', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 5, Id: 5, Code: 'Code', Name: 'Mã khách hàng', Type: 'Text', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 5, Id: 5, Code: 'IDBusinessPartnerGroup', Name: 'Nhóm khách hàng', Type: 'Number', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
        { IDSchema: 5, Id: 5, Code: 'IsStaff', Name: 'Nhân viên', Type: 'Number', Icon: 'star', Aggregate: '', Sort: 1, Remark: '' },
      ]

    this.transformOperators= [
      { code: 'TextGroup', name: 'Text', icon: '', disabled: true },
      { code: '=', name: 'is', icon: '' },
      { code: 'like', name: 'contains', icon: '' },
      { code: 'Text', name: 'starts with', icon: '' },
      { code: 'Text', name: 'ends with', icon: '' },
      { code: 'Text', name: 'is not', icon: '' },
      { code: 'Text', name: 'does not contain', icon: '' },
      { code: 'Text',  name: 'does not start with', icon: '' },
      { code: 'Text', name: 'does not end with', icon: '' },
      { code: 'Text', name: 'matches regexp', icon: '' },

      { code: 'NumberGroup', name: 'Number', icon: '', disabled: true },
      { code: '=', name: 'equals', icon: '' },
      { code: '>', name: 'greater than', icon: '' },
      { code: '<', name: 'less than', icon: '' },
      { code: '>=', name: 'greater than or equals', icon: '' },
      { code: '<=', name: 'less than or equals', icon: '' },
      { code: '<>', name: 'does not equal', icon: '' },

      { code: 'BooleanGroup', name: 'Boolean', icon: '', disabled: true },
      { code: '1', name: 'true', icon: '' },
      { code: '0', name: 'false', icon: '' }
      ];

    this.logicalOperators=[
        { code: 'AND', name: 'AND', icon: '' },
        { code: 'OR', name: 'OR', icon: '' },
      ];

    this.schemaDetailList = schemaDetailList.filter(x=>x.IDSchema == schemaList.find(x=>x.Code == this.Condition.Scema).Id);
    this.formGroup = this.formBuilder.group({
      Dimension: [this.filter.Dimension,Validators.required],
      Operator: [this.filter.Operator,Validators.required],     
      Value: [this.filter.Dimension !== 'logical' ? this.filter.Value : null, this.filter.Dimension !== 'logical' ? [Validators.required] : []],
      Logicals: this.pathValueCondition(this.filter.Logicals),
      UniqueId : [ this.generateUniqueId()]
      });
      this.connectionList.push(this.formGroup.controls.UniqueId.value);
  }

  pathValueCondition(array) {
    var formArray:FormArray = this.formBuilder.array([])
    array.forEach(i => {
      let group = this.formBuilder.group({
        Dimension: [i.Dimension, Validators.required],
        Operator: [i.Operator, Validators.required],
        Logicals: (i.Logicals!=undefined && i.Logicals.length>0)?this.pathValueCondition(i.Logicals):this.formBuilder.array([]),
        Value:[i.Dimension != 'logical'?i.Value:null,(i.Dimension != 'logical')?[Validators.required]:[]],  
        UniqueId : [ this.generateUniqueId()]
      });
      this.connectionList.push(group.controls.UniqueId.value);
      formArray.push(group);
    })
    return formArray;
  }

  changeDimension(formGroup:any){
      var dimension = formGroup.get('Dimension').value;
      if(dimension!='logical'){
      formGroup.get('Logicals').clear();
      formGroup.get('Value').setValidators([Validators.required])
      }
      else{
      formGroup.get('Value').setValue(null)
      formGroup.get('Value').setValidators([])
      }
      formGroup.get('Value').updateValueAndValidity();
  }

  addNewForm(formArray: FormArray) {
    if(formArray == undefined){
      formArray = this.formBuilder.array([]);
    }
    var fg  = this.formBuilder.group({ 
      Dimension :  [null,[Validators.required]],
      Operator : [null,[Validators.required]],
      Logicals:this.formBuilder.array([]),
      Value: [null,[Validators.required]],  
      UniqueId : [ this.generateUniqueId()]
    })
    formArray.push(fg);
    this.connectionList.push(fg.controls.UniqueId.value);
  }

  removeForm(form: FormGroup, parentForm: FormGroup): void {
    if (parentForm && parentForm.controls?.Logicals instanceof FormArray) {
      const index = parentForm.controls.Logicals?.controls.indexOf(form);
      if (index !== -1) {
        parentForm.controls.Logicals.removeAt(index);
      }
    }
  }

  applyData(){
    if (!this.formGroup.valid) {
        this.env.showTranslateMessage('erp.app.app-component.page-bage.check-red-above','warning');
    }
    console.log(this.formGroup.getRawValue());
    // return this.modalController.dismiss(this.formGroup.getRawValue(),this.Condition.Scema);
  }
  drop(event: CdkDragDrop<FormArray>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data.controls, event.previousIndex, event.currentIndex);
    } else {
      console.log('success')
      transferArrayItem(event.previousContainer.data.controls,
                        event.container.data.controls,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
  generateUniqueId(): string {
    return Math.random().toString(36).slice(2, 7);
  }
}
