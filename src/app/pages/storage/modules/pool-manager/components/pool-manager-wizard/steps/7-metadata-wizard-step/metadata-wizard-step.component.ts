import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs';
import { CreateVdevLayout, TopologyItemType, VdevType } from 'app/enums/v-dev-type.enum';
import helptext from 'app/helptext/storage/volumes/manager/manager';
import { AddVdevsStore } from 'app/pages/storage/modules/pool-manager/components/add-vdevs/store/add-vdevs-store.service';
import { PoolManagerStore } from 'app/pages/storage/modules/pool-manager/store/pool-manager.store';

@UntilDestroy()
@Component({
  selector: 'ix-metadata-wizard-step',
  templateUrl: './metadata-wizard-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataWizardStepComponent implements OnInit {
  @Input() isStepActive: boolean;
  @Input() stepWarning: string | null;
  @Output() goToLastStep = new EventEmitter<void>();

  canChangeLayout = true;

  protected readonly VdevType = VdevType;
  readonly helptext = helptext;

  protected readonly inventory$ = this.store.getInventoryForStep(VdevType.Special);
  protected allowedLayouts = [CreateVdevLayout.Mirror, CreateVdevLayout.Stripe];

  constructor(
    private addVdevsStore: AddVdevsStore,
    private store: PoolManagerStore,
    private cdr: ChangeDetectorRef,
  ) {}

  goToReviewStep(): void {
    this.goToLastStep.emit();
  }

  resetStep(): void {
    this.store.resetStep(VdevType.Special);
  }

  ngOnInit(): void {
    this.addVdevsStore.pool$.pipe(
      map((pool) => pool?.topology[VdevType.Data]),
      untilDestroyed(this),
    ).subscribe((dataTopology) => {
      if (!dataTopology?.length) {
        return;
      }
      // TODO: Similar code in poolTopologyToStoreTopology
      let type = dataTopology[0].type;
      if (type === TopologyItemType.Disk && !dataTopology[0].children.length) {
        type = TopologyItemType.Stripe;
      } else if (type === TopologyItemType.Draid) {
        switch (dataTopology[0].stats.draid_parity) {
          case 2:
            type = CreateVdevLayout.Draid2 as unknown as TopologyItemType;
            break;
          case 3:
            type = CreateVdevLayout.Draid3 as unknown as TopologyItemType;
            break;
          default:
            type = CreateVdevLayout.Draid1 as unknown as TopologyItemType;
            break;
        }
      }
      this.allowedLayouts = [type] as unknown as CreateVdevLayout[];
      this.canChangeLayout = false;
      this.cdr.markForCheck();
    });
  }
}
