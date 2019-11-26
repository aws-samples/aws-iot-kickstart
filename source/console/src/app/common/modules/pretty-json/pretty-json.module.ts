import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { PrettyJsonComponent } from './pretty-json.component';

// Pipes
import { PipesModule } from '@pipes/pipes.module';

@NgModule({
    declarations: [PrettyJsonComponent],
    exports: [PrettyJsonComponent],
    imports: [
        CommonModule,
        FormsModule,

        // Pipes
        PipesModule
    ]
})
export class PrettyJsonModule {}
