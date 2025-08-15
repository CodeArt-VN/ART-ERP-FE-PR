import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, Config, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, PR_ProgramProvider, SYS_SchemaProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { ConditionComponent } from '../condition/condition.component';
import { Prop } from 'ionicons/dist/types/stencil-public-runtime';

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
	ListBranches = [];
	schema: any;
	isModalFilter = false;
	tempItemList: any;
	countItem = 0;
	type: any;
	@ViewChild('popoverPub') popoverPub;
	@ViewChild('appFilterHavingClause') appFilterHavingClause;

	_measureMethodDataSource: any;
	isOpenPopover = false;
	pickerGroupName;
	MeasureBy: any = [];
	formGroupMeasureBy;
	_schemaDetailsList: any;
	_havingClause: any;
	config;
	configHaving;
	_dataSouceDimension: any;
	transformOperators = [
		{ code: 'TextGroup', name: 'Text', icon: '', disabled: true },
		{ code: '=', name: '= is', icon: '' },
		{ code: 'like', name: 'contains', icon: '' },
		// { code: 'starts with', name: 'starts with', icon: '' },
		// { code: 'ends with', name: 'ends with', icon: '' },
		{ code: '<>', name: '≠ does not equal', icon: '' },
		{ code: 'IN', name: 'in', icon: '' },
		{ code: 'NOT IN', name: 'not in', icon: '' },

		// { code: 'Text', name: 'does not contain', icon: '' },
		// { code: 'Text', name: 'does not start with', icon: '' },
		// { code: 'Text', name: 'does not end with', icon: '' },
		// { code: 'Text', name: 'matches regexp', icon: '' },

		{ code: 'NumberGroup', name: 'Number', icon: '', disabled: true },
		{ code: '=', name: '= equals', icon: '' },
		{ code: '>', name: '> greater than', icon: '' },
		{ code: '<', name: '< less than', icon: '' },
		{ code: '>=', name: '≥ greater than or equals', icon: '' },
		{ code: '<=', name: '≤ less than or equals', icon: '' },
		{ code: '<>', name: '≠ does not equal', icon: '' },

		{ code: 'BooleanGroup', name: 'Boolean', icon: '', disabled: true },
		{ code: '1', name: 'true', icon: '' },
		{ code: '0', name: 'false', icon: '' },
	];

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
		public modalController: ModalController,
		public schemaService: SYS_SchemaProvider
	) {
		super();
		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			IDBranch: [this.env.selectedBranch],
			Branches: [],
			Name: [''],
			Type: [''],
			Code: ['', Validators.required],
			Status: new FormControl({ value: 'New', disabled: true }),
			Sort: [0],
			FromDate: ['', Validators.required],
			ToDate: ['', Validators.required],
			ApplicableFromHour: [''], // , Validators.required
			ApplicableToHour: [''], //, Validators.required
			ExclusionFromHour: [''], // , Validators.required
			ExclusionToHour: [''], //, Validators.required
			IsPublic: [false],
			IsAutoApply: [false],
			IsApplyAllProduct: [false],
			IsApplyAllCustomer: [false],
			IsApplyAllBranch: [false],
			MinOrderValue: [0],
			IsByPercent: [false],
			MaxValue: [0],
			Value: [0],
			NumberOfCoupon: [0],
			MaxUsagePerCustomer: [0],
			IsDiscount: [false],
			IsItemPromotion: [false],
			IsUseWithOrthersPromotion: [false],
			IsDisabled: [false],
			IsDeleted: [false],
			ConfigItem: [''],
			ConfigContact: [''],
			ConfigBranch: [''],
		});
		this.formGroupMeasureBy = this.formBuilder.group({
			Method: [''],
			Property: [''],
		});
		this.pageConfig.isDetailPage = true;
	}
	loadedData(event) {
		if (this.item?.Id) {
			this.item.FromDate = lib.dateFormat(this.item.FromDate, 'yyyy-mm-dd');
			this.item.ToDate = lib.dateFormat(this.item.ToDate, 'yyyy-mm-dd');
		}
		super.loadedData();
		if (this.formGroup.controls.Status.value !== 'New') {
			this.formGroup.disable();
		}

		this.ListBranches = lib.cloneObject(this.env.branchList);

		this.markNestedNode(this.ListBranches, this.env.selectedBranch);

		console.log(this.ListBranches);
		if (!this.formGroup.controls.IsByPercent.value) {
			this.formGroup.controls.MaxValue.disable();
		} else {
			this.formGroup.controls.MaxValue.enable();
		}

		this._measureMethodDataSource = [
			{ Code: 'count', Name: 'Count {0}', icon: '' },
			{ Code: 'count distinct', Name: 'Count DISTINCT {0}', icon: '' },
			{ Code: 'sum', Name: 'Sum of {0}', icon: '' },
			{ Code: 'max', Name: 'Max of {0}', icon: '' },
			{ Code: 'min', Name: 'Min of {0}', icon: '' },
			{ Code: 'average', Name: 'Average {0}', icon: '' },
		];
	}

	addNewForm(e, type) {
		let group = this.formBuilder.group({
			Property: [''],
			Method: [''],
		});
		if (type == 'MeasureBy') {
			this.presentPopover(e, group, 'MeasureBy');
		}
	}

	presentPopover(event, fg, groupName) {
		this.pickerGroupName = groupName;
		this.formGroupMeasureBy = fg;
		this.isOpenPopover = true;
		this.popoverPub.event = event;
	}

	dismissPopover(apply: boolean = false) {
		if (!this.isOpenPopover) return;
		let group = this.formBuilder.group({
			Dimension: [],
			Operator: [],
			Value: [],
		});
		if (apply) {
			this.MeasureBy = [...this.MeasureBy, this.formGroupMeasureBy.getRawValue()];
			this._dataSouceDimension = {
				Fields: [
					...this.MeasureBy.map((x) => {
						return {
							PropertyType: 'Field',
							Name: `${x.Method}(${x.Property})`,
							Code: `${x.Method}(${x.Property})`,
							DataType: 'decimal',
						};
					}),
				],
			};
		}
		this.isOpenPopover = false;
	}

	removeForm(e, fg): void {
		e.preventDefault();
		let index = this.MeasureBy.indexOf(fg);
		this.MeasureBy.splice(index, 1);
	}

	openModalFilter(code) {
		this.isModalFilter = true;
		this.type = code;
		this.config = undefined;
		this.MeasureBy = [];
		this._dataSouceDimension = undefined;
		this.configHaving = undefined;
		if (code == 'CONTACT') {
			this.schemaService.commonService
				.connect('GET', 'BI/Schema/GetSchemaByCode', { Code: 'Contact_SALE_Order', Type: 'Datamart' })
				.toPromise()
				.then((value: any) => {
					if (value) this.schema = value;
					if (this.formGroup.controls.ConfigContact.value) {
						let configData = JSON.parse(this.formGroup.controls.ConfigContact.value);
						this.config = configData.Transform.Filter;
						this.MeasureBy = configData.MeasureBy;
						if (this.MeasureBy?.length > 0) {
							this._dataSouceDimension = {
								Fields: [
									...this.MeasureBy.map((x) => {
										return {
											PropertyType: 'Field',
											Name: `${x.Method}(${x.Property})`,
											Code: `${x.Method}(${x.Property})`,
											DataType: 'decimal',
										};
									}),
								],
							};
						}
						this.configHaving = configData.HavingClause;
					}
					this._schemaDetailsList = this.schema?.Fields;
					console.log(this.schema);
				});
		} else if (code == 'ITEM') {
			this.schemaService.commonService
				.connect('GET', 'BI/Schema/GetSchemaByCode', { Code: 'WMS_Item', Type: 'DBTable' })
				.toPromise()
				.then((value: any) => {
					if (value) this.schema = value;
					if (this.formGroup.controls.ConfigItem.value) {
						let configData = JSON.parse(this.formGroup.controls.ConfigItem.value);
						this.config = configData.Transform.Filter;
					}
					this._schemaDetailsList = this.schema?.Fields;
					console.log(this.schema);
				});
		} else {
			this.schemaService.commonService
				.connect('GET', 'BI/Schema/GetSchemaByCode', { Code: 'SALE_Order', Type: 'DBTable' })
				.toPromise()
				.then((value: any) => {
					if (value) this.schema = value;
					if (this.formGroup.controls.ConfigBranch.value) {
						let configData = JSON.parse(this.formGroup.controls.ConfigBranch.value);
						this.config = configData.Transform.Filter;
						this.MeasureBy = configData.MeasureBy;
						if (this.MeasureBy?.length > 0) {
							this._dataSouceDimension = {
								Fields: [
									...this.MeasureBy.map((x) => {
										return {
											PropertyType: 'Field',
											Name: `${x.Method}(${x.Property})`,
											Code: `${x.Method}(${x.Property})`,
											DataType: 'decimal',
										};
									}),
								],
							};
						}
						this.configHaving = configData.HavingClause;
					}
					this._schemaDetailsList = this.schema?.Fields;

					console.log(this.schema);
				});
		}
	}

	getSchemaDetailType(form) {
		let field = this.schema.Fields.find((x) => x.Code == form.get('Dimension')?.value);
		return field?.DataType;
	}

	filterConfig(e) {
		let apiPath = '';
		let config: any;
		let _schema = {
			Id: this.schema.Id,
			Code: this.schema.Code,
			Name: this.schema.Name,
			Type: this.schema.Type,
		};
		if (this.type == 'CONTACT') {
			apiPath = 'ApplyContact';
			if (this._dataSouceDimension) this.appFilterHavingClause.onFormSubmit();
			config = {
				Schema: _schema,
				CompareBy: [{ Property: 'IDContact' }],
				MeasureBy: this.MeasureBy,
				HavingClause: this._havingClause,
				Transform: { Filter: e },
			};
			this.formGroup.controls.ConfigContact.patchValue(JSON.stringify(config));
			this.formGroup.controls.ConfigContact.markAsDirty();
		} else if (this.type == 'ITEM') {
			apiPath = 'ApplyItem';
			config = {
				Schema: _schema,
				CompareBy: [{ Property: 'Id' }, { Property: 'Code' }, { Property: 'Name' }],
				// MeasureBy: [{ Property: 'QuantityOnHand', Method: 'sum', Title: 'CurrentQuantity' }],
				Transform: { Filter: e },
			};
			this.formGroup.controls.ConfigItem.patchValue(JSON.stringify(config));
			this.formGroup.controls.ConfigItem.markAsDirty();
		} else {
			apiPath = 'ApplyBranch';
			if (this._dataSouceDimension) this.appFilterHavingClause.onFormSubmit();
			config = {
				Schema: _schema,
				CompareBy: [{ Property: 'IDBranch' }],
				MeasureBy: this.MeasureBy,
				HavingClause: this._havingClause,
				Transform: { Filter: e },
			};
			this.formGroup.controls.ConfigBranch.patchValue(JSON.stringify(config));
			this.formGroup.controls.ConfigBranch.markAsDirty();
		}
		this.saveChange();
		// this.env
		//   .showLoading(
		//     'Please wait for a few moments',
		//     this.pageProvider.commonService.connect('POST', 'BI/Schema/QueryReportData', config).toPromise(),
		//   )
		//   .then((data: any) => {
		//     if (data) {
		//       this.tempItemList = data.Data;
		//       this.countItem = data.Data.length;
		//       this.env
		//         .showPrompt('Bạn có muốn áp dụng?', null, {
		//           code: 'Tìm thấy {{value}} dòng dữ liệu',
		//           value: this.countItem,
		//         })
		//         .then((_) => {
		//           let obj: any = {
		//             id: this.formGroup.get('Id').value,
		//             items: this.tempItemList,
		//           };
		//           this.isModalFilter = false;
		//           this.env
		//             .showLoading(
		//               'Please wait for a few moments',
		//               this.pageProvider.commonService.connect('POST', 'PR/ProgramCondition/' + apiPath, obj).toPromise(),
		//             )
		//             .then((result: any) => {
		//               if (result > 0) {
		//                 if (this.type == 'CONTACT')
		//                   this.formGroup.controls.ConfigContact.patchValue(JSON.stringify(config));
		//                 if (this.type == 'ITEM') this.formGroup.controls.ConfigItem.patchValue(JSON.stringify(config));
		//                 if (this.type == 'BRANCH') this.formGroup.controls.ConfigBranch.patchValue(JSON.stringify(config));
		//                 // this.refresh();
		//               }
		//             });
		//         })
		//         .catch((err) => {});
		//     }
		//   });
	}

	markNestedNode(ls, Id) {
		let IDParent = ls.find((i) => i.Id == Id).IDParent;
		ls.filter((d) => d.Id == IDParent).forEach((i) => {
			i.disabled = true;
			this.markNestedNode(ls, i.Id);
		});
	}

	generateCodeVoucher() {
		let code = lib.generateCode().toUpperCase();
		this.formGroup.controls.Code.patchValue(code);
		this.formGroup.controls.Code.markAsDirty();
		this.saveChange();
	}

	changeTest() {
		console.log(this.formGroup.controls.Branches.value);
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

		if (!this.formGroup.controls.IsByPercent.value) {
			this.formGroup.controls.MaxValue.disable();
		} else {
			this.formGroup.controls.MaxValue.enable();
		}

		// if (this.formGroup.controls.IsApplyAllProduct.value) {
		//   this.formGroup.controls.ConfigItem.removeValidators([Validators.required]);
		//   this.formGroup.controls.ConfigItem.updateValueAndValidity();
		// } else {
		//   this.formGroup.controls.ConfigItem.addValidators([Validators.required]);
		//   this.formGroup.controls.ConfigItem.updateValueAndValidity();

		// }

		// if (this.formGroup.controls.IsApplyAllCustomer.value) {
		//   this.formGroup.controls.ConfigContact.removeValidators([Validators.required]);
		//   this.formGroup.controls.ConfigContact.updateValueAndValidity();
		// } else {
		//   this.formGroup.controls.ConfigContact.addValidators([Validators.required]);
		//   this.formGroup.controls.ConfigContact.updateValueAndValidity();

		// }

		// if (this.formGroup.controls.IsApplyAllBranch.value) {
		//   this.formGroup.controls.ConfigBranch.removeValidators([Validators.required]);
		//   this.formGroup.controls.ConfigBranch.updateValueAndValidity();
		// } else {
		//   this.formGroup.controls.ConfigBranch.addValidators([Validators.required]);
		//   this.formGroup.controls.ConfigBranch.updateValueAndValidity();

		// }

		if (this.formGroup.valid) {
			return super.saveChange2();
		}
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
