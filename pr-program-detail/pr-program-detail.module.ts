import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PRProgramDetailPage } from './pr-program-detail.page';
import { FileUploadModule } from 'ng2-file-upload';
import { NgSelectModule } from '@ng-select/ng-select';
import { ShareModule } from 'src/app/share.module';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgxMaskModule } from 'ngx-mask';
import { RouterModule, Routes } from '@angular/router';
import { ConditionModule } from '../condition/condition.module';

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
    NgSelectModule,
    NgOptionHighlightModule,
    ShareModule,
    ConditionModule,
    NgxMaskModule.forRoot(),
    RouterModule.forChild(routes)
  ],
  declarations: [PRProgramDetailPage]
})
export class PRProgramDetailPageModule {}
