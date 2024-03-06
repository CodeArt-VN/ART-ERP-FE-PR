import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PRProgramPage } from './pr-program.page';
import { ShareModule } from 'src/app/share.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    RouterModule.forChild([{ path: '', component: PRProgramPage }]),
  ],
  declarations: [PRProgramPage],
})
export class PRProgramPageModule {}
