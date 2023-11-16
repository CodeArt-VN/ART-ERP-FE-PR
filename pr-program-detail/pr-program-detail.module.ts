import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PRProgramDetailPage } from './pr-program-detail.page';
import { FileUploadModule } from 'ng2-file-upload';
import { ShareModule } from 'src/app/share.module';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { RouterModule, Routes } from '@angular/router';
import { ConditionModule } from '../condition/condition.module';
import { FilterModalModule } from '../filter-modal/filter-modal.module';

const routes: Routes = [
  {
    path: '',
    component: PRProgramDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    FileUploadModule,
    ShareModule,
    ConditionModule,
    FilterModalModule,
  
    RouterModule.forChild(routes)
  ],
  declarations: [PRProgramDetailPage]
})
export class PRProgramDetailPageModule {}
