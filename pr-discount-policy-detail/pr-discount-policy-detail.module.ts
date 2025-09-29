import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { RouterModule, Routes } from '@angular/router';
import { PRDiscountPolicyDetailPage } from './pr-discount-policy-detail.page';

const routes: Routes = [
	{
		path: '',
		component: PRDiscountPolicyDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
	declarations: [PRDiscountPolicyDetailPage],
})
export class PRDiscountPolicyDetailPageModule {}
