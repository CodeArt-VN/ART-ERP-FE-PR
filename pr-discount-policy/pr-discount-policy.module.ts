import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { RouterModule } from '@angular/router';
import { PRDiscountPolicyPage } from './pr-discount-policy.page';

@NgModule({
  imports: [
    ShareModule,
    CommonModule,
    FormsModule,
    IonicModule,

    RouterModule.forChild([{ path: '', component: PRDiscountPolicyPage }]),
  ],
  declarations: [PRDiscountPolicyPage],
})
export class PRDiscountPolicyPageModule {}
