import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { MLDemoSqueezenetV10Component } from './ml-demo-squeezenet-v1.0.component';

// Pipes
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
    declarations: [MLDemoSqueezenetV10Component],
    exports: [MLDemoSqueezenetV10Component],
    imports: [PipesModule, CommonModule],
    providers: []
})
export class MLDemoSqueezenetV10Module {}
