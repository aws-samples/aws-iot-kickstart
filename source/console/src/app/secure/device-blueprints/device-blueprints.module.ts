import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { SecureHomeLayoutComponent } from '@secure/secure-home-layout.component';
import { TableModule } from '@common-modules/table/table.module';

import { DeviceBlueprintComponent } from './device-blueprint.component';
import { DeviceBlueprintsComponent } from './device-blueprints.component';

// Pipes
import { PipesModule } from '@pipes/pipes.module';
import { PrettyJsonModule } from '@common-modules/pretty-json/pretty-json.module';

const deviceBlueprintsRoutes: Routes = [
    {
        path: 'securehome/device-blueprints',
        component: SecureHomeLayoutComponent,
        children: [{ path: ':id', component: DeviceBlueprintComponent }, { path: '', component: DeviceBlueprintsComponent }]
    }
];

@NgModule({
    declarations: [DeviceBlueprintComponent, DeviceBlueprintsComponent],
    exports: [RouterModule, DeviceBlueprintComponent, DeviceBlueprintsComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(deviceBlueprintsRoutes),

        // Modules
        PrettyJsonModule,
        TableModule,

        // Pipes
        PipesModule
    ]
})
export class DeviceBlueprintsModule {}
