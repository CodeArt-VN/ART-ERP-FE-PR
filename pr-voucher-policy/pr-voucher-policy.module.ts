import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { RouterModule } from '@angular/router';
import { PRVoucherPolicyPage } from './pr-voucher-policy.page';

@NgModule({
  imports: [
    ShareModule,
    CommonModule,
    FormsModule,
    IonicModule,
    
    RouterModule.forChild([{ path: '', component: PRVoucherPolicyPage }])
  ],
  declarations: [PRVoucherPolicyPage]
})
export class PRVoucherPolicyPageModule {}
