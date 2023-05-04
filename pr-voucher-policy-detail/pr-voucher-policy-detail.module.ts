import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FileUploadModule } from 'ng2-file-upload';
import { NgSelectModule } from '@ng-select/ng-select';
import { ShareModule } from 'src/app/share.module';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgxMaskModule } from 'ngx-mask';
import { RouterModule, Routes } from '@angular/router';
import { PRVoucherPolicyDetailPage } from './pr-voucher-policy-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PRVoucherPolicyDetailPage
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
    NgxMaskModule.forRoot(),
    RouterModule.forChild(routes)
  ],
  declarations: [PRVoucherPolicyDetailPage]
})
export class PRVoucherPolicyDetailPageModule {}
