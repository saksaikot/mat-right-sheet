/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
/** Injection token that can be used to access the data that was passed in to a bottom sheet. */
export const MAT_RIGHT_SHEET_DATA = new InjectionToken('MatRightSheetData');
/**
 * Configuration used when opening a right sheet.
 */
export class MatRightSheetConfig {
    constructor() {
        /** Data being injected into the child component. */
        this.data = null;
        /** Whether the bottom sheet has a backdrop. */
        this.hasBackdrop = true;
        /** Whether the user can use escape or clicking outside to close the bottom sheet. */
        this.disableClose = false;
        /** Aria label to assign to the bottom sheet element. */
        this.ariaLabel = null;
        /**
         * Whether the bottom sheet should close when the user goes backwards/forwards in history.
         * Note that this usually doesn't include clicking on links (unless the user is using
         * the `HashLocationStrategy`).
         */
        this.closeOnNavigation = true;
        // Note that this is set to 'dialog' by default, because while the a11y recommendations
        // are to focus the first focusable element, doing so prevents screen readers from reading out the
        // rest of the bottom sheet content.
        /**
         * Where the bottom sheet should focus on open.
         * @breaking-change 14.0.0 Remove boolean option from autoFocus. Use string or
         * AutoFocusTarget instead.
         */
        this.autoFocus = 'dialog';
        /**
         * Whether the bottom sheet should restore focus to the
         * previously-focused element, after it's closed.
         */
        this.restoreFocus = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlnaHQtc2hlZXQuY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvcmlnaHQtc2hlZXQvc3JjL2xpYi9yaWdodC1zaGVldC5jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFFLGNBQWMsRUFBb0IsTUFBTSxlQUFlLENBQUM7QUFLakUsZ0dBQWdHO0FBQ2hHLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLElBQUksY0FBYyxDQUFNLG1CQUFtQixDQUFDLENBQUM7QUFFakY7O0dBRUc7QUFDSCxNQUFNLE9BQU8sbUJBQW1CO0lBQWhDO1FBVUUsb0RBQW9EO1FBQzdDLFNBQUksR0FBYyxJQUFJLENBQUM7UUFFOUIsK0NBQStDO1FBQ3hDLGdCQUFXLEdBQWEsSUFBSSxDQUFDO1FBS3BDLHFGQUFxRjtRQUM5RSxpQkFBWSxHQUFhLEtBQUssQ0FBQztRQUV0Qyx3REFBd0Q7UUFDakQsY0FBUyxHQUFtQixJQUFJLENBQUM7UUFFeEM7Ozs7V0FJRztRQUNJLHNCQUFpQixHQUFhLElBQUksQ0FBQztRQUUxQyx1RkFBdUY7UUFDdkYsa0dBQWtHO1FBQ2xHLG9DQUFvQztRQUNwQzs7OztXQUlHO1FBQ0YsY0FBUyxHQUF3QyxRQUFRLENBQUM7UUFFM0Q7OztXQUdHO1FBQ0ksaUJBQVksR0FBYSxJQUFJLENBQUM7SUFTdkMsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQgeyBEaXJlY3Rpb24gfSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7IFNjcm9sbFN0cmF0ZWd5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xyXG5pbXBvcnQgeyBJbmplY3Rpb25Ub2tlbiwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuLyoqIE9wdGlvbnMgZm9yIHdoZXJlIHRvIHNldCBmb2N1cyB0byBhdXRvbWF0aWNhbGx5IG9uIGRpYWxvZyBvcGVuICovXHJcbmV4cG9ydCB0eXBlIEF1dG9Gb2N1c1RhcmdldCA9ICdkaWFsb2cnIHwgJ2ZpcnN0LXRhYmJhYmxlJyB8ICdmaXJzdC1oZWFkaW5nJztcclxuXHJcbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBhY2Nlc3MgdGhlIGRhdGEgdGhhdCB3YXMgcGFzc2VkIGluIHRvIGEgYm90dG9tIHNoZWV0LiAqL1xyXG5leHBvcnQgY29uc3QgTUFUX1JJR0hUX1NIRUVUX0RBVEEgPSBuZXcgSW5qZWN0aW9uVG9rZW48YW55PignTWF0UmlnaHRTaGVldERhdGEnKTtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIHVzZWQgd2hlbiBvcGVuaW5nIGEgcmlnaHQgc2hlZXQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTWF0UmlnaHRTaGVldENvbmZpZzxEID0gYW55PiB7XHJcbiAgLyoqIFRoZSB2aWV3IGNvbnRhaW5lciB0byBwbGFjZSB0aGUgb3ZlcmxheSBmb3IgdGhlIGJvdHRvbSBzaGVldCBpbnRvLiAqL1xyXG4gIHB1YmxpYyB2aWV3Q29udGFpbmVyUmVmPzogVmlld0NvbnRhaW5lclJlZjtcclxuXHJcbiAgLyoqIEV4dHJhIENTUyBjbGFzc2VzIHRvIGJlIGFkZGVkIHRvIHRoZSBib3R0b20gc2hlZXQgY29udGFpbmVyLiAqL1xyXG4gIHB1YmxpYyBwYW5lbENsYXNzPzogc3RyaW5nIHwgQXJyYXk8c3RyaW5nPjtcclxuXHJcbiAgLyoqIFRleHQgbGF5b3V0IGRpcmVjdGlvbiBmb3IgdGhlIGJvdHRvbSBzaGVldC4gKi9cclxuICBwdWJsaWMgZGlyZWN0aW9uPzogRGlyZWN0aW9uO1xyXG5cclxuICAvKiogRGF0YSBiZWluZyBpbmplY3RlZCBpbnRvIHRoZSBjaGlsZCBjb21wb25lbnQuICovXHJcbiAgcHVibGljIGRhdGE/OiBEIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBib3R0b20gc2hlZXQgaGFzIGEgYmFja2Ryb3AuICovXHJcbiAgcHVibGljIGhhc0JhY2tkcm9wPzogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIC8qKiBDdXN0b20gY2xhc3MgZm9yIHRoZSBiYWNrZHJvcC4gKi9cclxuICBwdWJsaWMgYmFja2Ryb3BDbGFzcz86IHN0cmluZztcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgY2FuIHVzZSBlc2NhcGUgb3IgY2xpY2tpbmcgb3V0c2lkZSB0byBjbG9zZSB0aGUgYm90dG9tIHNoZWV0LiAqL1xyXG4gIHB1YmxpYyBkaXNhYmxlQ2xvc2U/OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIC8qKiBBcmlhIGxhYmVsIHRvIGFzc2lnbiB0byB0aGUgYm90dG9tIHNoZWV0IGVsZW1lbnQuICovXHJcbiAgcHVibGljIGFyaWFMYWJlbD86IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBib3R0b20gc2hlZXQgc2hvdWxkIGNsb3NlIHdoZW4gdGhlIHVzZXIgZ29lcyBiYWNrd2FyZHMvZm9yd2FyZHMgaW4gaGlzdG9yeS5cclxuICAgKiBOb3RlIHRoYXQgdGhpcyB1c3VhbGx5IGRvZXNuJ3QgaW5jbHVkZSBjbGlja2luZyBvbiBsaW5rcyAodW5sZXNzIHRoZSB1c2VyIGlzIHVzaW5nXHJcbiAgICogdGhlIGBIYXNoTG9jYXRpb25TdHJhdGVneWApLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbG9zZU9uTmF2aWdhdGlvbj86IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAvLyBOb3RlIHRoYXQgdGhpcyBpcyBzZXQgdG8gJ2RpYWxvZycgYnkgZGVmYXVsdCwgYmVjYXVzZSB3aGlsZSB0aGUgYTExeSByZWNvbW1lbmRhdGlvbnNcclxuICAvLyBhcmUgdG8gZm9jdXMgdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50LCBkb2luZyBzbyBwcmV2ZW50cyBzY3JlZW4gcmVhZGVycyBmcm9tIHJlYWRpbmcgb3V0IHRoZVxyXG4gIC8vIHJlc3Qgb2YgdGhlIGJvdHRvbSBzaGVldCBjb250ZW50LlxyXG4gIC8qKlxyXG4gICAqIFdoZXJlIHRoZSBib3R0b20gc2hlZXQgc2hvdWxkIGZvY3VzIG9uIG9wZW4uXHJcbiAgICogQGJyZWFraW5nLWNoYW5nZSAxNC4wLjAgUmVtb3ZlIGJvb2xlYW4gb3B0aW9uIGZyb20gYXV0b0ZvY3VzLiBVc2Ugc3RyaW5nIG9yXHJcbiAgICogQXV0b0ZvY3VzVGFyZ2V0IGluc3RlYWQuXHJcbiAgICovXHJcbiAgIGF1dG9Gb2N1cz86IEF1dG9Gb2N1c1RhcmdldCB8IHN0cmluZyB8IGJvb2xlYW4gPSAnZGlhbG9nJztcclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgYm90dG9tIHNoZWV0IHNob3VsZCByZXN0b3JlIGZvY3VzIHRvIHRoZVxyXG4gICAqIHByZXZpb3VzbHktZm9jdXNlZCBlbGVtZW50LCBhZnRlciBpdCdzIGNsb3NlZC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzdG9yZUZvY3VzPzogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIC8qKiBTY3JvbGwgc3RyYXRlZ3kgdG8gYmUgdXNlZCBmb3IgdGhlIGJvdHRvbSBzaGVldC4gKi9cclxuICBzY3JvbGxTdHJhdGVneT86IFNjcm9sbFN0cmF0ZWd5O1xyXG5cclxuICAvKipcclxuICAgKiB3aWR0aCBvZiBvdmVybGF5XHJcbiAgICovXHJcbiAgcHVibGljIHdpZHRoPzogc3RyaW5nO1xyXG59XHJcbiJdfQ==