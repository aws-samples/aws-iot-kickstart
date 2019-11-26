import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { SecureHomeLayoutComponent } from '@secure/secure-home-layout.component';
import { TableModule } from '@common-modules/table/table.module';

import { SystemBlueprintComponent } from './system-blueprint.component';
import { SystemBlueprintsComponent } from './system-blueprints.component';

// Pipes
import { PipesModule } from '@pipes/pipes.module';
import { PrettyJsonModule } from '@common-modules/pretty-json/pretty-json.module';

const systemBlueprintsRoutes: Routes = [
    {
        path: 'securehome/system-blueprints',
        component: SecureHomeLayoutComponent,
        children: [{ path: ':id', component: SystemBlueprintComponent }, { path: '', component: SystemBlueprintsComponent }]
    }
];

@NgModule({
    declarations: [SystemBlueprintComponent, SystemBlueprintsComponent],
    exports: [RouterModule, SystemBlueprintComponent, SystemBlueprintsComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(systemBlueprintsRoutes),

        // Modules
        PrettyJsonModule,
        TableModule,

        // Pipes
        PipesModule
    ]
})
export class SystemBlueprintsModule {}
