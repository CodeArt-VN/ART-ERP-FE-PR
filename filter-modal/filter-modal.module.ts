import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {DragDropModule, CdkDrag,CdkDropList,CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ShareModule } from "../../../share.module";
import { FilterModalComponent } from './filter-modal.component';

@NgModule({
    declarations: [
        FilterModalComponent
    ],
    exports: [
        FilterModalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        ShareModule,
        DragDropModule,
        CdkDrag,
        CdkDropList,
        CdkDropListGroup
    ]
})
export class FilterModalModule { }