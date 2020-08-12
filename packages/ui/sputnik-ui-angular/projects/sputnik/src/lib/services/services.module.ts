import { NgModule, Injectable } from '@angular/core'
import { CommonModule } from '@angular/common'
// AWS Specific
import { AmplifyService } from 'aws-amplify-angular'
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular'
// API
// import { ApiService } from '@deathstar/sputnik-ui-angular-api'
// Modules
import { S3Module } from './s3/s3.module'
// Services
import { AdminService } from './admin.service'
import { AppSyncService } from './appsync.service'
import { BreadCrumbService } from './bread-crumb.service'
import { DeploymentService } from './deployment.service'
import { DeviceService } from './device.service'
import { DeviceBlueprintService } from './device-blueprint.service'
import { DeviceTypeService } from './device-type.service'
import { IoTService } from './iot.service'
import { SettingService } from './setting.service'
import { SystemService } from './system.service'
import { SystemBlueprintService } from './system-blueprint.service'
import { StatService } from './stat.service'
// import { UserService } from './user.service'
import { RealTimeDataService } from './realtime-data/service'
// import { AdminService } from './admin.service';
// import { StatsService } from './stats.service';
// import { MQTTService } from './mqtt.service';
// import { DeviceSubViewComponentService } from './device-sub-view-component.service';

@NgModule({
	imports: [AmplifyUIAngularModule, CommonModule, S3Module],
	providers: [
		// UserService,
		// // AppSync API service
		// ApiService,

		// Explict services defined in UI
		// TODO: replace these with API service above when possible
		AdminService,
		AmplifyService,
		AppSyncService,
		BreadCrumbService,
		DeploymentService,
		DeviceService,
		DeviceBlueprintService,
		DeviceTypeService,
		IoTService,
		SettingService,
		SystemService,
		SystemBlueprintService,
		StatService,
		RealTimeDataService,
	],
})
export class AppServicesModule {}
