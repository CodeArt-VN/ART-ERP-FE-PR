import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PRProgramDetailPage } from './pr-program-detail.page';
import { ShareModule } from 'src/app/share.module';
import { RouterModule, Routes } from '@angular/router';
import { ConditionModule } from '../condition/condition.module';
import { ProgramVoucherPage } from '../pr-program-voucher/pr-program-voucher.page';

const routes: Routes = [
	{
		path: '',
		component: PRProgramDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, ConditionModule, RouterModule.forChild(routes)],
	declarations: [PRProgramDetailPage,ProgramVoucherPage]})
export class PRProgramDetailPageModule {}
