import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramItemProvider, PR_ProgramPartnerProvider, PR_ProgramProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { ConditionComponent } from '../condition/condition.component';
import { ApiSetting } from 'src/app/services/static/api-setting';

@Component({
	selector: 'app-pr-voucher-policy-detail',
	templateUrl: './pr-voucher-policy-detail.page.html',
	styleUrls: ['./pr-voucher-policy-detail.page.scss'],
	standalone: false,
})
export class PRVoucherPolicyDetailPage extends PageBase {
	Discounts = [];
	Bonus = [];
	NumberPartner = 0;
	NumberItem = 0;

	constructor(
		public pageProvider: PR_ProgramProvider,
		public programPartnerProvider: PR_ProgramPartnerProvider,
		public programItemProvider: PR_ProgramItemProvider,
		public branchProvider: BRA_BranchProvider,
		public popoverCtrl: PopoverController,
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
			Name: ['', Validators.required],
			Code: ['', Validators.required],
			Remark: [''],
			Type: new FormControl({ value: '', disabled: true }),
			Status: new FormControl({ value: '', disabled: true }),
			FromDate: ['', Validators.required],
			ToDate: ['', Validators.required],
			IsPublic: [false],
			IsAutoApply: [false],
			IsApplyAllProduct: [false],
			IsApplyAllCustomer: [false],
			MinOrderValue: [10000],
			IsByPercent: [false],
			MaxValue: [0, Validators.required],
			Value: ['', Validators.required],
			NumberOfCoupon: ['', Validators.required],
			MaxUsagePerCustomer: [''],
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
			this.countPartner(this.item.Id);
			this.countItem(this.item.Id);
			// if(this.item.Status != 'New'){
			//   this.formGroup.disable();
			// }
		} else {
			this.formGroup.controls.Status.setValue('New');
			this.formGroup.controls.Type.setValue('Voucher');
		}
		super.loadedData();
	}
	async condition(Type: string) {
		if (this.id == 0) {
			this.env.showMessage('Vui lòng nhập thông tin phía trên', 'warning');
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
			canDismiss: true,
			backdropDismiss: true,
			cssClass: 'modal-change-table',
			componentProps: {
				Condition: {
					Type: Type,
					Title: title,
					IDProgram: this.item.Id,
					TypeProgram: 'Voucher',
				},
			},
		});
		await modal.present();
		const { data, role } = await modal.onWillDismiss();
		if (role == 'ITEM') {
			this.NumberItem = data.length;
		} else if (role == 'CONTACT') {
			this.NumberPartner = data.length;
		}
	}
	async saveChange() {
		if (!this.item?.Id) {
			this.formGroup.controls.Status.markAsDirty();
			this.formGroup.controls.Type.markAsDirty();
		}
		if (this.formGroup.controls.IsByPercent.value == true && this.formGroup.controls.Value.value > 99) {
			this.formGroup.controls.Value.patchValue(0);
			this.formGroup.controls.Value.markAsDirty();
		}
		if (this.formGroup.valid) {
			super.saveChange2();
		}
	}
	generateCodeVoucher() {
		let code = lib.generateCode().toUpperCase();
		this.formGroup.controls.Code.patchValue(code);
		this.formGroup.controls.Code.markAsDirty();
		this.saveChange();
	}
	countPartner(id) {
		let apiPath = {
			method: 'GET',
			url: function (id) {
				return ApiSetting.apiDomain('PR/Program/CountPartner/') + id;
			},
		};
		this.commonService
			.connect(apiPath.method, apiPath.url(id), null)
			.toPromise()
			.then((result: any) => {
				this.NumberPartner = result;
			})
			.catch((err) => {
				console.log(err);
			});
	}
	countItem(id) {
		let apiPath = {
			method: 'GET',
			url: function (id) {
				return ApiSetting.apiDomain('PR/Program/CountItem/') + id;
			},
		};
		this.commonService
			.connect(apiPath.method, apiPath.url(id), null)
			.toPromise()
			.then((result: any) => {
				this.NumberItem = result;
			})
			.catch((err) => {
				console.log(err);
			});
	}
}
