import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';

export const PRRoutes: Routes = [
    
    { path: 'pr-deal', loadChildren: () => import('./pr-deal/pr-deal.module').then(m => m.PRDealPageModule), canActivate: [AuthGuard] },
    { path: 'pr-deal/:id', loadChildren: () => import('./pr-deal-detail/pr-deal-detail.module').then(m => m.PRDealDetailPageModule), canActivate: [AuthGuard] },
    
    { path: 'pr-program', loadChildren: () => import('./pr-program/pr-program.module').then(m => m.PRProgramPageModule), canActivate: [AuthGuard] },
    { path: 'pr-program/:id', loadChildren: () => import('./pr-program-detail/pr-program-detail.module').then(m => m.PRProgramDetailPageModule), canActivate: [AuthGuard] },
    
    { path: 'pr-voucher-policy', loadChildren: () => import('./pr-voucher-policy/pr-voucher-policy.module').then(m => m.PRVoucherPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'pr-voucher-policy/:id', loadChildren: () => import('./pr-voucher-policy-detail/pr-voucher-policy-detail.module').then(m => m.PRVoucherPolicyDetailPageModule), canActivate: [AuthGuard] },
    
    { path: 'pr-discount-policy', loadChildren: () => import('./pr-discount-policy/pr-discount-policy.module').then(m => m.PRDiscountPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'pr-discount-policy/:id', loadChildren: () => import('./pr-discount-policy-detail/pr-discount-policy-detail.module').then(m => m.PRDiscountPolicyDetailPageModule), canActivate: [AuthGuard] },
  
];
