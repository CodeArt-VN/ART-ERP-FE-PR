import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { ConditionComponent } from '../condition/condition.component';

@Component({
	selector: 'app-pr-program-detail',
	templateUrl: './pr-program-detail.page.html',
	styleUrls: ['./pr-program-detail.page.scss'],
	standalone: false,
})
export class PRProgramDetailPage extends PageBase {
	Discounts = [];
	Bonus = [];
	ListItem = [];

	constructor(
		public pageProvider: PR_ProgramProvider,
		public branchProvider: BRA_BranchProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public modalController: ModalController
	) {
		super();
		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			IDBranch: [this.env.selectedBranch],
			Name: [''],
			Type: [''],
			Status: [''],
			FromDate: ['', Validators.required],
			ToDate: ['', Validators.required],
			IsPublic: [false],
			IsAutoApply: [false],
			IsApplyAllProduct: [false],
			IsApplyAllCustomer: [false],
			MinOrderValue: [0],
			IsByPercent: [false],
			MaxValue: [0],
			Value: [0],
			NumberOfCoupon: [0],
			MaxUsagePerCustomer: [0],
			IsDiscount: [false],
			IsItemPromotion: [false],
			IsDisabled: [false],
			IsDeleted: [false],
		});
		this.pageConfig.isDetailPage = true;
	}
	loadedData(event) {
		if (this.item?.Id) {
			this.item.FromDate = lib.dateFormat(this.item.FromDate, 'yyyy-mm-dd');
			this.item.ToDate = lib.dateFormat(this.item.ToDate, 'yyyy-mm-dd');
		}
		super.loadedData();
	}
	async condition(Type: string) {
		if (this.id == 0) {
			return false;
		}
		let title = '';
		if (Type == 'ITEM') {
			title = 'Sản phẩm áp dụng';
		} else if (Type == 'CONTACT') {
			title = 'Khách hàng áp dụng';
		}
		const modal = await this.modalController.create({
			component: ConditionComponent,
			backdropDismiss: true,
			cssClass: 'modal-change-table',
			componentProps: {
				Condition: {
					Type: Type,
					Title: title,
					IDProgram: this.item.Id,
					TypeProgram: 'Discount',
				},
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		this.ListItem = data;
		this.addLevelDiscount();
	}
	addLevelDiscount() {
		let discount = {
			Name: 'Hạn mức',
			ListItem: this.ListItem,
		};
		this.Discounts.push(discount);
	}
	addLevelBonus() {
		let bonus = {
			Name: 'Hạn mức',
			ListItem: this.ListItem,
		};
		this.Bonus.push(bonus);
	}
}
