import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramItemProvider, PR_ProgramPartnerProvider, PR_ProgramProvider, SYS_SchemaProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { ConditionComponent } from '../condition/condition.component';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { ProgramVoucherPage } from '../pr-program-voucher/pr-program-voucher.page';

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
	schema: any;
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
		public modalController: ModalController,
		public schemaService: SYS_SchemaProvider
	) {
		super();
		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			IDBranch: [this.env.selectedBranch],
			Name: ['', Validators.required],
			Code: [''],
			Remark: [''],
			Type: new FormControl({ value: '', disabled: true }),
			Status: new FormControl({ value: '', disabled: true }),
			FromDate: ['', Validators.required],
			ToDate: ['', Validators.required],
			IsPublic: [false],
			IsAutoApply: [false],
			IsApplyAllBranch: [true],
			IsApplyAllProduct: [true],
			IsApplyAllCustomer: [true],
			MinOrderValue: [''],
			IsByPercent: [false],
			MaxValue: [0, Validators.required],
			Value: ['', Validators.required],
			NumberOfCopy: ['', Validators.required],
			MaxUsagePerCustomer: [''],
			IsDiscount: [false],
			IsItemPromotion: [false],
			IsDisabled: [false],
			IsDeleted: [false],
			Filter: [''],
			_Filter: [''],
			IsGenerateVoucher: [''],
			NumberOfGeneratedVoucher: [''],
			VoucherCode: [''],
			VoucherPrefix: [''],
			VoucherSuffix: [''],
			VoucherCodeLength: [''],
			VoucherIsUpperCase: [true],
			VoucherIsBreak: [false],
			VoucherBreakPartLength: [4],
			VoucherBreakChar: ['-'],
			VoucherRadix: [36],
		});
		this.pageConfig.isDetailPage = true;
	}
	loadedData(event) {
		if (this.item?.Id) {
			this.item.FromDate = lib.dateFormat(this.item.FromDate, 'yyyy-mm-dd');
			this.item.ToDate = lib.dateFormat(this.item.ToDate, 'yyyy-mm-dd');
			this.countPartner(this.item.Id);
			this.countItem(this.item.Id);
			if (this.item.Status != 'New') {
				this.formGroup.disable();
			}
		} else {
			this.formGroup.controls.Status.setValue('New');
			this.formGroup.controls.Type.setValue('Voucher');
		}
		super.loadedData();

		if (!this.formGroup.controls.IsByPercent.value || this.item.Status != 'New') {
			this.formGroup.controls.MaxValue.disable();
		} else {
			this.formGroup.controls.MaxValue.enable();
		}
		if (this.item.Filter) {
			this.formGroup.controls._Filter.setValue(JSON.parse(this.item.Filter));
		}

		this.schemaService.commonService
			.connect('GET', 'BI/Schema/GetSchemaByCode', { Code: 'WMS_Item', Type: 'DBTable' })
			.toPromise()
			.then((value: any) => {
				if (value) this.schema = value;
			});
	}

	changeIsGenerateVoucher() {
		if (this.formGroup.controls.IsGenerateVoucher.value) {
			this.formGroup.get('NumberOfGeneratedVoucher').addValidators([Validators.required]);
			this.formGroup.get('NumberOfGeneratedVoucher').updateValueAndValidity();
			this.formGroup.get('VoucherCode').setValue(null);
			this.formGroup.get('VoucherCode').clearValidators();
			this.formGroup.get('VoucherCode').updateValueAndValidity();
			this.formGroup.get('VoucherCode').markAsDirty;
		} else {
			this.formGroup.get('NumberOfGeneratedVoucher').setValue(null);
			this.formGroup.get('NumberOfGeneratedVoucher').clearValidators();
			this.formGroup.get('NumberOfGeneratedVoucher').updateValueAndValidity();
			this.formGroup.get('NumberOfGeneratedVoucher').markAsDirty;
		}
		this.saveChange();
	}

	generatedVoucher() {
		this.env
			.showLoading('Generating vouchers ....', this.pageProvider.commonService.connect('POST', 'PR/ProgramVoucher/GenerateVoucher', { IDProgram: this.item.Id, Quantity: this.item.NumberOfGeneratedVoucher }).toPromise())
			.then((_) => {
				this.env.showMessage('Generate vouchers success', 'success');
			});
	}

	async openVoucherList() {
		const modal = await this.modalController.create({
			component: ProgramVoucherPage,
			componentProps: {
				IDProgram: this.item.Id,
			},
			cssClass: 'modal300',
		});
		await modal.present();
	}

	saveConfig(e) {
		this.formGroup.controls.Filter.setValue(JSON.stringify(e));
		this.formGroup.controls.Filter.markAsDirty();
		this.formGroup.controls._Filter.setValue(e);
		this.saveChange();
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
			this.formGroup.controls.IsApplyAllBranch.markAsDirty();
			this.formGroup.controls.IsApplyAllCustomer.markAsDirty();
			this.formGroup.controls.IsApplyAllProduct.markAsDirty();
		}
		if (this.formGroup.controls.IsByPercent.value == true && this.formGroup.controls.Value.value > 99) {
			this.formGroup.controls.Value.patchValue(0);
			this.formGroup.controls.Value.markAsDirty();
		}
		if (!this.formGroup.controls.IsByPercent.value) {
			this.formGroup.controls.MaxValue.disable();
		} else {
			this.formGroup.controls.MaxValue.enable();
		}
		// if (this.formGroup.valid) {
		super.saveChange2();
		// }
	}
	generateCodeVoucher() {
		let code = lib.generateCode().toUpperCase();
		this.formGroup.controls.VoucherCode.patchValue(code);
		this.formGroup.controls.VoucherCode.markAsDirty();
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

	submit(): void {
		let text = 'Gửi Duyệt';
		let message = 'Sau khi gửi duyệt, bạn không thể chỉnh sửa đối tượng được nữa. Bạn có chắc muốn gửi duyệt tất cả đối tượng chưa duyệt?';
		this.changeStatus(text, message, 'Submitted');
	}

	approve(): void {
		let text = 'Duyệt';
		let message = 'Bạn có chắc chắn duyệt các đối tượng này?';
		this.changeStatus(text, message, 'Approved');
	}

	disapprove(): void {
		let text = 'Không Duyệt';
		let message = 'Bạn có chắc chắn không duyệt các đối tượng này?';
		this.changeStatus(text, message, 'Disapproved');
	}

	cancel(): void {
		let text = 'Huỷ';
		let message = 'Bạn có chắc chắn huỷ các đối tượng này?';
		this.changeStatus(text, message, 'Rejected');
	}

	changeStatus(text, message, Status) {
		this.alertCtrl
			.create({
				header: text,
				//subHeader: '---',
				message: message,
				buttons: [
					{
						text: 'Hủy',
						role: 'cancel',
						handler: () => {
							//console.log('Không xóa');
						},
					},
					{
						text: 'Xác nhận',
						cssClass: 'danger-btn',
						handler: () => {
							let publishEventCode = this.pageConfig.pageName;
							let apiPath = {
								method: 'POST',
								url: function () {
									return ApiSetting.apiDomain('PR/Program/ChangeStatus/');
								},
							};

							if (this.submitAttempt == false) {
								this.submitAttempt = true;
								let postDTO = {
									Ids: [this.id],
									Status: Status,
								};
								this.pageProvider.commonService
									.connect(apiPath.method, apiPath.url(), postDTO)
									.toPromise()
									.then((savedItem: any) => {
										if (publishEventCode) {
											this.env.publishEvent({
												Code: publishEventCode,
											});
										}
										this.env.showMessage('Saving completed!', 'success');
										this.submitAttempt = false;
										this.refresh(null);
									})
									.catch((err) => {
										this.submitAttempt = false;
										//console.log(err);
									});
							}
						},
					},
				],
			})
			.then((alert) => {
				alert.present();
			});
	}
}
