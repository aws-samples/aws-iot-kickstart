import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { SecureHomeLayoutComponent } from '@secure/secure-home-layout.component';
import { TableModule } from '@common-modules/table/table.module';

import { DeviceTypeComponent } from './device-type.component';
import { DeviceTypesComponent } from './device-types.component';

// Pipes
import { PipesModule } from '@pipes/pipes.module';
import { PrettyJsonModule } from '@common-modules/pretty-json/pretty-json.module';

const deviceTypesRoutes: Routes = [
    {
        path: 'securehome/device-types',
        component: SecureHomeLayoutComponent,
        children: [{ path: ':id', component: DeviceTypeComponent }, { path: '', component: DeviceTypesComponent }]
    }
];

@NgModule({
    declarations: [DeviceTypeComponent, DeviceTypesComponent],
    exports: [RouterModule, DeviceTypeComponent, DeviceTypesComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(deviceTypesRoutes),

        // Modules
        PrettyJsonModule,
        TableModule,

        // Pipes
        PipesModule
    ]
})
export class DeviceTypesModule {}
