import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * This pipe tells Angular to trust the provided HTML content.
 * It's used to prevent Angular's built-in security from stripping
 * out styles or tags from the HTML returned by the AI.
 * Use it like this: <div [innerHTML]="htmlContent | safeHtml"></div>
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}

  /**
   * @param value The HTML string to be trusted.
   * @returns A SafeHtml object that Angular can render securely.
   */
  transform(value: string): SafeHtml {
    // This is the core function that bypasses Angular's default security
    // and trusts the HTML string.
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
