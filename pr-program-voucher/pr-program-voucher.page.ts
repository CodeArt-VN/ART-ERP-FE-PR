import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';

import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramVoucherProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-pr-program-voucher',
	templateUrl: './pr-program-voucher.page.html',
	styleUrls: ['./pr-program-voucher.page.scss'],
	standalone: false,
})
export class ProgramVoucherPage extends PageBase {

	@ViewChild('importfile') importfile: any;
	IDProgram = 0;

	constructor(
		public pageProvider: PR_ProgramVoucherProvider,
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
	}

	loadData(event?: any, forceReload?: boolean): void {
		this.query.IDProgram = this.IDProgram;
		super.loadData(event, forceReload);
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


}
