import {
  Component, ViewChild, ElementRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { FieldConfig } from '../../models/field-config.interface';
import { Field } from '../../models/field.interface';

@Component({
  selector: 'form-textarea-button',
  templateUrl: './form-textarea-button.component.html',
  styleUrls: ['../dynamic-field/dynamic-field.scss'],
})
export class FormTextareaButtonComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  fieldShow: string;

  @ViewChild('textAreaSSH', { static: true })
  textAreaSSH: ElementRef;

  constructor(public translate: TranslateService) {}

  customEventMethod($event: MouseEvent): void {
    if (this.config.customEventMethod !== undefined && this.config.customEventMethod != null) {
      this.config.customEventMethod({ event: $event, textAreaSSH: this.textAreaSSH });
    }

    $event.preventDefault();
  }
}
