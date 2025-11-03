import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';

import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramProvider, PR_ProgramVoucherProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-pr-program-voucher',
	templateUrl: './pr-program-voucher.page.html',
	styleUrls: ['./pr-program-voucher.page.scss'],
	standalone: false,
})
export class ProgramVoucherPage extends PageBase {
	@ViewChild('importfile') importfile: any;
	IDProgram = 0;
	isModalVoucherConfig = false;
	programFormGroup;
	radixList = [];
	constructor(
		public pageProvider: PR_ProgramVoucherProvider,
		public programProvider: PR_ProgramProvider,
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

		this.programFormGroup = formBuilder.group({
			Id: [''],
			Quantity: [''],
			NumberOfGeneratedVoucher: [''],
			VoucherCode: [''],
			VoucherPrefix: [''],
			VoucherSuffix: [''],
			VoucherCodeLength: ['', Validators.max(100)],
			VoucherIsUpperCase: [true],
			VoucherIsBreak: [false],
			VoucherBreakPartLength: [4],
			VoucherBreakChar: ['-'],
			VoucherRadix: [36],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getType('base-radix'), this.programProvider.read({ Id: this.IDProgram })]).then((values: any) => {
			if (values[1].data && values[1].data.length > 0) {
				if (values[1].data[0].VoucherRadix !== undefined && values[1].data[0].VoucherRadix !== null) {
					values[1].data[0].VoucherRadix = values[1].data[0].VoucherRadix.toString();
				}
				this.programFormGroup.patchValue(values[1].data[0]);
			}
			this.radixList = values[0];
			super.preLoadData(event);
		});
	}

	loadData(event?: any, forceReload?: boolean): void {
		this.query.IDProgram = this.IDProgram;
		super.loadData(event, forceReload);
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.programFormGroup.controls.NumberOfGeneratedVoucher.value > 0) {
			this.programFormGroup.controls.Quantity.setValue(this.programFormGroup.controls.NumberOfGeneratedVoucher.value);
			this.programFormGroup.controls.Quantity.markAsDirty();
		}
		if (!this.pageConfig.canAddNewGeneratedVoucher) {
			this.programFormGroup.controls.Quantity.disable();
		}
	}

	onClickImport() {
		this.importfile.nativeElement.value = '';
		this.importfile.nativeElement.click();
	}
	importFileChange(event) {
		const formData: FormData = new FormData();
		formData.append('fileKey', event.target.files[0], event.target.files[0].name);
		this.env
			.showLoading(
				'Please wait for a few moments',
				this.pageProvider.commonService.connect('UPLOAD', 'PR/ProgramVoucher/ImportVoucher/' + this.IDProgram, formData).toPromise()
			)
			.then((resp: any) => {
				this.refresh();
				if (resp.ErrorList && resp.ErrorList.length) {
					let message = '';
					for (let i = 0; i < resp.ErrorList.length && i <= 5; i++)
						if (i == 5) message += '<br> Còn nữa...';
						else {
							const e = resp.ErrorList[i];
							message += '<br> ' + e.Id + '. Tại dòng ' + e.Line + ': ' + e.Message;
						}
					this.env
						.showPrompt(
							{
								code: 'Có {{value}} lỗi khi import: {{value1}}',
								value: { value: resp.ErrorList.length, value1: message },
							},
							'Bạn có muốn xem lại các mục bị lỗi?',
							'Có lỗi import dữ liệu'
						)
						.then((_) => {
							this.downloadURLContent(resp.FileUrl);
						})
						.catch((e) => {});
				} else {
					this.env.showMessage('Import completed!', 'success');
				}
			})
			.catch((err) => {
				if (err.statusText == 'Conflict') {
					this.downloadURLContent(err._body);
				}
			});
	}

	printProgramVoucher() {
		this.closeModal();
		this.nav('/voucher-printing/' + this.IDProgram, 'forward');
	}

	generatedVoucher() {
		let submitItem = this.getDirtyValues(this.programFormGroup);
		let postDTO = { ...submitItem, IDProgram: this.IDProgram };
		this.env.showLoading('Generating vouchers ....', this.pageProvider.commonService.connect('POST', 'PR/ProgramVoucher/GenerateVoucher', postDTO).toPromise()).then((_) => {
			this.env.showMessage('Generate vouchers success', 'success');
			this.isModalVoucherConfig = false;
			this.refresh();
		});
	}
}
