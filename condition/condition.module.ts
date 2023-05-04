import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConditionComponent } from './condition.component';
import { ShareModule } from "../../../share.module";
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
    declarations: [
        ConditionComponent
    ],
    exports: [
        ConditionComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        NgSelectModule,
        ShareModule
    ]
})
export class ConditionModule { }