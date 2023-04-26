import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { PR_ProgramProvider } from 'src/app/services/static/services.service';

@Component({
  selector: 'app-pr-voucher-policy',
  templateUrl: './pr-voucher-policy.page.html',
  styleUrls: ['./pr-voucher-policy.page.scss'],
})
export class PRVoucherPolicyPage extends PageBase {

  constructor( 
    public pageProvider: PR_ProgramProvider,
    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController
    ) {
        super(); 
        Object.assign(this.query, {Type:"Voucher"});       
    }

}
