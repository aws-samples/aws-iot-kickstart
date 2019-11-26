import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { S3ImageComponent } from './s3-image.component';

// Services
import { S3Service } from './s3.service';

@NgModule({
    declarations: [S3ImageComponent],
    exports: [S3ImageComponent],
    imports: [CommonModule],
    providers: [S3Service]
})
export class S3Module {}
