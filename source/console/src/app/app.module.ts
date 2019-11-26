import { COMPILER_OPTIONS, CompilerFactory, Compiler, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BlockUIModule } from 'ng-block-ui';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app.routes';

// AWS Specific
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

// Components
import { AppComponent } from './app.component';

// Components - Common
// import { PrettyJsonComponent } from './common/components/pretty-json/pretty-json.component';

// Components - Public
import { HomeComponent } from './public/home/home.component';
import { LoginComponent } from './public/auth/login/login.component';
import {
    LogoutComponent,
    RegistrationConfirmationComponent
} from './public/auth/confirm/confirm-registration.component';
import { ResendCodeComponent } from './public/auth/resend/resend-code.component';
import { ForgotPasswordStep1Component, ForgotPassword2Component } from './public/auth/forgot/forgot-password.component';
import { RegisterComponent } from './public/auth/register/registration.component';
import { NewPasswordComponent } from './public/auth/newpassword/new-password.component';
// Components - Secure - Common
import { IoTPubSuberComponent } from './secure/common/iot-pubsuber.component';
import { PrettifierComponent } from './secure/common/prettifier.component';
import { SecureHomeLayoutComponent } from './secure/secure-home-layout.component';
// Components - Secure
import { DeploymentsComponent } from './secure/deployments/deployments.component';
import { DeviceComponent } from './secure/devices/device.component';
import { DevicesComponent } from './secure/devices/devices.component';
import { MapsComponent } from './secure/maps/maps.component';
import { ProfileComponent } from './secure/profile/profile.component';
import { SecureHomeComponent } from './secure/home/secure-home.component';
import { SettingsComponent } from './secure/settings/settings.component';
import { UserComponent } from './secure/users/user.component';
import { UsersComponent } from './secure/users/users.component';

// Pipes
import { PipesModule } from './pipes/pipes.module';

// Services
import { AppServicesModule } from './services/services.module';
import { LoggerService, ConsoleLoggerService } from './services/logger.service';

// Common Modules
import { GaugeModule } from './common/modules/gauge/gauge.module';
import { PrettyJsonModule } from './common/modules/pretty-json/pretty-json.module';
import { TableModule } from './common/modules/table/table.module';

// Secure Modules
import { DeviceBlueprintsModule } from './secure/device-blueprints/device-blueprints.module';
import { DeviceTypesModule } from './secure/device-types/device-types.module';
import { SystemsModule } from './secure/systems/systems.module';
import { SystemBlueprintsModule } from './secure/system-blueprints/system-blueprints.module';

// System Modules
import { ChildViewsModule } from '@systems/child-views.module';

import { TestsModule } from './public/tests/tests.module';



// Addons compilation
export function createCompiler(fn: CompilerFactory): Compiler {
    return fn.createCompiler();
}

@NgModule({
    declarations: [
        AppComponent,

        // Components - Public
        LoginComponent,
        LogoutComponent,
        RegistrationConfirmationComponent,
        ResendCodeComponent,
        ForgotPasswordStep1Component,
        ForgotPassword2Component,
        RegisterComponent,
        NewPasswordComponent,
        HomeComponent,

        // Components - Secure - Common
        IoTPubSuberComponent,
        PrettifierComponent,

        // Components - Secure
        DeploymentsComponent,
        DeviceComponent,
        DevicesComponent,
        MapsComponent,
        ProfileComponent,
        SecureHomeLayoutComponent,
        SecureHomeComponent,
        SettingsComponent,
        UserComponent,
        UsersComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        // HttpModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule,
        ChartsModule,

        AppRoutingModule,

        // Common
        ChildViewsModule,
        GaugeModule,
        PrettyJsonModule,
        TableModule,

        // Secure
        DeviceBlueprintsModule,
        DeviceTypesModule,
        SystemsModule,
        SystemBlueprintsModule,

        BlockUIModule.forRoot(),
        SweetAlert2Module
            .forRoot
            //   {
            //   buttonsStyling: false,
            //   customClass: 'modal-content',
            //   confirmButtonClass: 'btn btn-primary',
            //   cancelButtonClass: 'btn'
            // }
            (),

        // Pipes
        PipesModule,

        // Services
        AppServicesModule,

        TestsModule

        // .forRoot()
    ],
    providers: [
        { provide: LoggerService, useClass: ConsoleLoggerService },
        {
            provide: COMPILER_OPTIONS,
            useValue: {},
            multi: true
        },
        {
            provide: CompilerFactory,
            useClass: JitCompilerFactory,
            deps: [COMPILER_OPTIONS]
        },
        {
            provide: Compiler,
            useFactory: createCompiler,
            deps: [CompilerFactory]
        }
    ],
    bootstrap: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {}
