/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { merge, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
/**
 * Reference to a bottom sheet dispatched from the bottom sheet service.
 */
export class MatRightSheetRef {
    constructor(containerInstance, _overlayRef, 
    // @breaking-change 8.0.0 `_location` parameter to be removed.
    _location) {
        this._overlayRef = _overlayRef;
        /** Subject for notifying the user that the bottom sheet has been dismissed. */
        this._afterDismissed = new Subject();
        /** Subject for notifying the user that the bottom sheet has opened and appeared. */
        this._afterOpened = new Subject();
        this.containerInstance = containerInstance;
        this.disableClose = containerInstance.rightSheetConfig.disableClose;
        // Emit when opening animation completes
        containerInstance._animationStateChanged
            .pipe(filter((event) => event.phaseName === 'done' &&
            event.toState === 'visible'), take(1))
            .subscribe(() => {
            this._afterOpened.next();
            this._afterOpened.complete();
        });
        // Dispose overlay when closing animation is complete
        containerInstance._animationStateChanged
            .pipe(filter((event) => event.phaseName === 'done' &&
            event.toState === 'hidden'), take(1))
            .subscribe(() => {
            this._overlayRef.dispose();
            this._afterDismissed.next(this._result);
            this._afterDismissed.complete();
        });
        merge(_overlayRef.backdropClick(), _overlayRef
            .keydownEvents()
            .pipe(filter((event) => event.keyCode === ESCAPE))).subscribe(() => {
            if (!this.disableClose &&
                (event.type !== 'keydown' || !hasModifierKey(event))) {
                event.preventDefault();
                this.dismiss();
            }
        });
    }
    /**
     * Dismisses the bottom sheet.
     * @param result Data to be passed back to the bottom sheet opener.
     */
    dismiss(result) {
        if (!this._afterDismissed.closed) {
            // Transition the backdrop in parallel to the bottom sheet.
            this.containerInstance._animationStateChanged
                .pipe(filter((event) => event.phaseName === 'start'), take(1))
                .subscribe(() => this._overlayRef.detachBackdrop());
            this._result = result;
            this.containerInstance.exit();
        }
    }
    /** Gets an observable that is notified when the bottom sheet is finished closing. */
    afterDismissed() {
        return this._afterDismissed.asObservable();
    }
    /** Gets an observable that is notified when the bottom sheet has opened and appeared. */
    afterOpened() {
        return this._afterOpened.asObservable();
    }
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     */
    backdropClick() {
        return this._overlayRef.backdropClick();
    }
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents() {
        return this._overlayRef.keydownEvents();
    }
    updateWidth(width) {
        this._overlayRef.updateSize({ width });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlnaHQtc2hlZXQucmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvcmlnaHQtc2hlZXQvc3JjL2xpYi9yaWdodC1zaGVldC5yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUcvRCxPQUFPLEVBQUUsS0FBSyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzlDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGdCQUFnQjtJQXNCM0IsWUFDRSxpQkFBeUMsRUFDeEIsV0FBdUI7SUFDeEMsOERBQThEO0lBQzlELFNBQW9CO1FBRkgsZ0JBQVcsR0FBWCxXQUFXLENBQVk7UUFYMUMsK0VBQStFO1FBQzlELG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQWlCLENBQUM7UUFFaEUsb0ZBQW9GO1FBQ25FLGlCQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQVdsRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7UUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7UUFFcEUsd0NBQXdDO1FBQ3hDLGlCQUFpQixDQUFDLHNCQUFzQjthQUNyQyxJQUFJLENBQ0gsTUFBTSxDQUNKLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDUixLQUFLLENBQUMsU0FBUyxLQUFLLE1BQU07WUFDMUIsS0FBSyxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQzlCLEVBQ0QsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNSO2FBQ0EsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztRQUVMLHFEQUFxRDtRQUNyRCxpQkFBaUIsQ0FBQyxzQkFBc0I7YUFDckMsSUFBSSxDQUNILE1BQU0sQ0FDSixDQUFDLEtBQUssRUFBRSxFQUFFLENBQ1IsS0FBSyxDQUFDLFNBQVMsS0FBSyxNQUFNO1lBQzFCLEtBQUssQ0FBQyxPQUFPLEtBQUssUUFBUSxDQUM3QixFQUNELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FDUjthQUNBLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBRUwsS0FBSyxDQUNILFdBQVcsQ0FBQyxhQUFhLEVBQUUsRUFDM0IsV0FBVzthQUNSLGFBQWEsRUFBRTthQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FDckQsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZO2dCQUNwQixDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQXNCLENBQUMsQ0FBQyxFQUFFO2dCQUN2RSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNoQjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE9BQU8sQ0FBQyxNQUFVO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRTtZQUNoQywyREFBMkQ7WUFDM0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHNCQUFzQjtpQkFDMUMsSUFBSSxDQUNILE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxPQUFPLENBQUMsRUFDOUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNSO2lCQUNBLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFFdEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO1NBQy9CO0lBQ0gsQ0FBQztJQUVELHFGQUFxRjtJQUM5RSxjQUFjO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRUQseUZBQXlGO0lBQ2xGLFdBQVc7UUFDaEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRDs7T0FFRztJQUNJLGFBQWE7UUFDbEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRDs7T0FFRztJQUNJLGFBQWE7UUFDbEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFTSxXQUFXLENBQUMsS0FBYTtRQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQgeyBFU0NBUEUsIGhhc01vZGlmaWVyS2V5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcclxuaW1wb3J0IHsgT3ZlcmxheVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcclxuaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBtZXJnZSwgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBmaWx0ZXIsIHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IE1hdFJpZ2h0U2hlZXRDb250YWluZXIgfSBmcm9tICcuL3JpZ2h0LXNoZWV0LmNvbnRhaW5lcic7XHJcblxyXG4vKipcclxuICogUmVmZXJlbmNlIHRvIGEgYm90dG9tIHNoZWV0IGRpc3BhdGNoZWQgZnJvbSB0aGUgYm90dG9tIHNoZWV0IHNlcnZpY2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTWF0UmlnaHRTaGVldFJlZjxUID0gYW55LCBSID0gYW55PiB7XHJcbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgbWFraW5nIHVwIHRoZSBjb250ZW50IG9mIHRoZSBib3R0b20gc2hlZXQuICovXHJcbiAgcHVibGljIGluc3RhbmNlOiBUO1xyXG5cclxuICAvKipcclxuICAgKiBJbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IGludG8gd2hpY2ggdGhlIGJvdHRvbSBzaGVldCBjb250ZW50IGlzIHByb2plY3RlZC5cclxuICAgKiBAZG9jcy1wcml2YXRlXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnRhaW5lckluc3RhbmNlOiBNYXRSaWdodFNoZWV0Q29udGFpbmVyO1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgdXNlciBpcyBhbGxvd2VkIHRvIGNsb3NlIHRoZSBib3R0b20gc2hlZXQuICovXHJcbiAgcHVibGljIGRpc2FibGVDbG9zZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcclxuXHJcbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGUgdXNlciB0aGF0IHRoZSBib3R0b20gc2hlZXQgaGFzIGJlZW4gZGlzbWlzc2VkLiAqL1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FmdGVyRGlzbWlzc2VkID0gbmV3IFN1YmplY3Q8UiB8IHVuZGVmaW5lZD4oKTtcclxuXHJcbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGUgdXNlciB0aGF0IHRoZSBib3R0b20gc2hlZXQgaGFzIG9wZW5lZCBhbmQgYXBwZWFyZWQuICovXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfYWZ0ZXJPcGVuZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICAvKiogUmVzdWx0IHRvIGJlIHBhc3NlZCBkb3duIHRvIHRoZSBgYWZ0ZXJEaXNtaXNzZWRgIHN0cmVhbS4gKi9cclxuICBwcml2YXRlIF9yZXN1bHQ6IFIgfCB1bmRlZmluZWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgY29udGFpbmVySW5zdGFuY2U6IE1hdFJpZ2h0U2hlZXRDb250YWluZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vdmVybGF5UmVmOiBPdmVybGF5UmVmLFxyXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSA4LjAuMCBgX2xvY2F0aW9uYCBwYXJhbWV0ZXIgdG8gYmUgcmVtb3ZlZC5cclxuICAgIF9sb2NhdGlvbj86IExvY2F0aW9uLFxyXG4gICkge1xyXG4gICAgdGhpcy5jb250YWluZXJJbnN0YW5jZSA9IGNvbnRhaW5lckluc3RhbmNlO1xyXG4gICAgdGhpcy5kaXNhYmxlQ2xvc2UgPSBjb250YWluZXJJbnN0YW5jZS5yaWdodFNoZWV0Q29uZmlnLmRpc2FibGVDbG9zZTtcclxuXHJcbiAgICAvLyBFbWl0IHdoZW4gb3BlbmluZyBhbmltYXRpb24gY29tcGxldGVzXHJcbiAgICBjb250YWluZXJJbnN0YW5jZS5fYW5pbWF0aW9uU3RhdGVDaGFuZ2VkXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIGZpbHRlcihcclxuICAgICAgICAgIChldmVudCkgPT5cclxuICAgICAgICAgICAgZXZlbnQucGhhc2VOYW1lID09PSAnZG9uZScgJiZcclxuICAgICAgICAgICAgZXZlbnQudG9TdGF0ZSA9PT0gJ3Zpc2libGUnLFxyXG4gICAgICAgICksXHJcbiAgICAgICAgdGFrZSgxKSxcclxuICAgICAgKVxyXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICB0aGlzLl9hZnRlck9wZW5lZC5uZXh0KCk7XHJcbiAgICAgICAgdGhpcy5fYWZ0ZXJPcGVuZWQuY29tcGxldGUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgLy8gRGlzcG9zZSBvdmVybGF5IHdoZW4gY2xvc2luZyBhbmltYXRpb24gaXMgY29tcGxldGVcclxuICAgIGNvbnRhaW5lckluc3RhbmNlLl9hbmltYXRpb25TdGF0ZUNoYW5nZWRcclxuICAgICAgLnBpcGUoXHJcbiAgICAgICAgZmlsdGVyKFxyXG4gICAgICAgICAgKGV2ZW50KSA9PlxyXG4gICAgICAgICAgICBldmVudC5waGFzZU5hbWUgPT09ICdkb25lJyAmJlxyXG4gICAgICAgICAgICBldmVudC50b1N0YXRlID09PSAnaGlkZGVuJyxcclxuICAgICAgICApLFxyXG4gICAgICAgIHRha2UoMSksXHJcbiAgICAgIClcclxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XHJcbiAgICAgICAgdGhpcy5fYWZ0ZXJEaXNtaXNzZWQubmV4dCh0aGlzLl9yZXN1bHQpO1xyXG4gICAgICAgIHRoaXMuX2FmdGVyRGlzbWlzc2VkLmNvbXBsZXRlKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIG1lcmdlKFxyXG4gICAgICBfb3ZlcmxheVJlZi5iYWNrZHJvcENsaWNrKCksXHJcbiAgICAgIF9vdmVybGF5UmVmXHJcbiAgICAgICAgLmtleWRvd25FdmVudHMoKVxyXG4gICAgICAgIC5waXBlKGZpbHRlcigoZXZlbnQpID0+IGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSkpLFxyXG4gICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMuZGlzYWJsZUNsb3NlICYmXHJcbiAgICAgICAgKGV2ZW50LnR5cGUgIT09ICdrZXlkb3duJyB8fCAhaGFzTW9kaWZpZXJLZXkoZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkpKSB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLmRpc21pc3MoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNtaXNzZXMgdGhlIGJvdHRvbSBzaGVldC5cclxuICAgKiBAcGFyYW0gcmVzdWx0IERhdGEgdG8gYmUgcGFzc2VkIGJhY2sgdG8gdGhlIGJvdHRvbSBzaGVldCBvcGVuZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGRpc21pc3MocmVzdWx0PzogUik6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9hZnRlckRpc21pc3NlZC5jbG9zZWQpIHtcclxuICAgICAgLy8gVHJhbnNpdGlvbiB0aGUgYmFja2Ryb3AgaW4gcGFyYWxsZWwgdG8gdGhlIGJvdHRvbSBzaGVldC5cclxuICAgICAgdGhpcy5jb250YWluZXJJbnN0YW5jZS5fYW5pbWF0aW9uU3RhdGVDaGFuZ2VkXHJcbiAgICAgICAgLnBpcGUoXHJcbiAgICAgICAgICBmaWx0ZXIoKGV2ZW50KSA9PiBldmVudC5waGFzZU5hbWUgPT09ICdzdGFydCcpLFxyXG4gICAgICAgICAgdGFrZSgxKSxcclxuICAgICAgICApXHJcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9vdmVybGF5UmVmLmRldGFjaEJhY2tkcm9wKCkpO1xyXG5cclxuICAgICAgdGhpcy5fcmVzdWx0ID0gcmVzdWx0O1xyXG4gICAgICB0aGlzLmNvbnRhaW5lckluc3RhbmNlLmV4aXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBpcyBub3RpZmllZCB3aGVuIHRoZSBib3R0b20gc2hlZXQgaXMgZmluaXNoZWQgY2xvc2luZy4gKi9cclxuICBwdWJsaWMgYWZ0ZXJEaXNtaXNzZWQoKTogT2JzZXJ2YWJsZTxSIHwgdW5kZWZpbmVkPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fYWZ0ZXJEaXNtaXNzZWQuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgaXMgbm90aWZpZWQgd2hlbiB0aGUgYm90dG9tIHNoZWV0IGhhcyBvcGVuZWQgYW5kIGFwcGVhcmVkLiAqL1xyXG4gIHB1YmxpYyBhZnRlck9wZW5lZCgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcclxuICAgIHJldHVybiB0aGlzLl9hZnRlck9wZW5lZC5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW4gdGhlIG92ZXJsYXkncyBiYWNrZHJvcCBoYXMgYmVlbiBjbGlja2VkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBiYWNrZHJvcENsaWNrKCk6IE9ic2VydmFibGU8TW91c2VFdmVudD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWYuYmFja2Ryb3BDbGljaygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiBrZXlkb3duIGV2ZW50cyBhcmUgdGFyZ2V0ZWQgb24gdGhlIG92ZXJsYXkuXHJcbiAgICovXHJcbiAgcHVibGljIGtleWRvd25FdmVudHMoKTogT2JzZXJ2YWJsZTxLZXlib2FyZEV2ZW50PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZi5rZXlkb3duRXZlbnRzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlV2lkdGgod2lkdGg6IHN0cmluZykge1xyXG4gICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVTaXplKHt3aWR0aH0pO1xyXG4gIH1cclxufVxyXG4iXX0=