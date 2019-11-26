import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { SecureHomeLayoutComponent } from '@secure/secure-home-layout.component';

import { SystemComponent } from './system.component';
import { SystemsComponent } from './systems.component';
import { SystemEditModalComponent } from './system.edit.modal.component';
import { SystemsModalComponent } from './systems.modal.component';

// Modules
import { ChildViewsModule } from '../child-views/child-views.module';
import { TableModule } from '@common-modules/table/table.module';
import { PipesModule } from '@pipes/pipes.module';
import { PrettyJsonModule } from '@common-modules/pretty-json/pretty-json.module';

const systemsRoutes: Routes = [
    {
        path: 'securehome/systems',
        component: SecureHomeLayoutComponent,
        children: [{ path: ':id', component: SystemComponent }, { path: '', component: SystemsComponent }]
    }
];

@NgModule({
    declarations: [SystemComponent, SystemsComponent, SystemEditModalComponent, SystemsModalComponent],
    entryComponents: [SystemEditModalComponent, SystemsModalComponent],
    exports: [RouterModule, SystemComponent, SystemsComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(systemsRoutes),

        // Modules
        ChildViewsModule,
        PipesModule,
        PrettyJsonModule,
        TableModule

    ]
})
export class SystemsModule {}
