import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramConditionProvider } from 'src/app/services/static/services.service';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.page.html',
  styleUrls: ['./condition.page.scss'],
})
export class ConditionPage extends PageBase{
  ConditionForm;
  Condition;
  itemsState: any = [];
  constructor(
    //public pageProvider: PR_ProgramConditionProvider, 
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
    this.addConditionForm();
  }
  loadedData(event) {
    this.buildFlatTree(this.items, this.itemsState, true).then((resp:any)=>{
        this.itemsState = resp;
    });
    super.loadedData(event);
  }
  addConditionForm(IDParent = null, level = 0) {
    let group = this.formBuilder.group({ 
      Id: new FormControl({ value: '', disabled: true }),
      IDProgram:[this.Condition?.IDProgram],
      IDParent:new FormControl({ value: IDParent, disabled:true}),
      IsItemFilterCondition:[false],
      Attribute: [null],
      Operator: [null],      
      Condition:[''],
      Level:[level],
    });  
    this.ConditionForm.push(group);
  }
  removeConditionForm(i: number): void {
    this.ConditionForm.removeAt(i);
  }
  
}
