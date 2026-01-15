/**
 * Tags Input Component Tests
 *
 * Unit tests for TagsInputComponent covering:
 * - Tag display
 * - Adding tags
 * - Removing tags
 * - Max tags limit
 * - Readonly mode
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TagsInputComponent } from './tags-input.component';

// Test host component to control inputs
@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [TagsInputComponent],
  template: `
    <app-tags-input
      [tags]="tags"
      [placeholder]="placeholder"
      [maxTags]="maxTags"
      [readonly]="readonly"
      [showCounter]="showCounter"
      (tagsChange)="onTagsChange($event)"
    />
  `,
})
class TestHostComponent {
  tags: string[] = [];
  placeholder = 'Add tag...';
  maxTags = 0;
  readonly = false;
  showCounter = true;

  changedTags: string[] | null = null;

  onTagsChange(tags: string[]): void {
    this.changedTags = tags;
    this.tags = tags;
  }
}

describe('TagsInputComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let component: TagsInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();

    // Get the tags input component instance
    const tagsInputDebugEl = hostFixture.debugElement.children[0];
    component = tagsInputDebugEl.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============= Display Tests =============

  describe('Tag Display', () => {
    it('should display existing tags', () => {
      hostComponent.tags = ['tag1', 'tag2', 'tag3'];
      hostFixture.detectChanges();

      const chips = hostFixture.nativeElement.querySelectorAll('.tag-chip');
      expect(chips.length).toBe(3);
    });

    it('should show tag text', () => {
      hostComponent.tags = ['urgent'];
      hostFixture.detectChanges();

      const chip = hostFixture.nativeElement.querySelector('.tag-chip');
      expect(chip.textContent).toContain('urgent');
    });

    it('should show counter when showCounter is true and maxTags > 0', () => {
      hostComponent.tags = ['tag1', 'tag2'];
      hostComponent.maxTags = 5;
      hostComponent.showCounter = true;
      hostFixture.detectChanges();

      const counter = hostFixture.nativeElement.querySelector('.tags-counter');
      expect(counter).toBeTruthy();
      expect(counter.textContent).toContain('2/5');
    });

    it('should hide counter when showCounter is false', () => {
      hostComponent.showCounter = false;
      hostFixture.detectChanges();

      const counter = hostFixture.nativeElement.querySelector('.tags-counter');
      expect(counter).toBeNull();
    });

    it('should hide counter when maxTags is 0', () => {
      hostComponent.maxTags = 0;
      hostComponent.showCounter = true;
      hostFixture.detectChanges();

      const counter = hostFixture.nativeElement.querySelector('.tags-counter');
      expect(counter).toBeNull();
    });
  });

  // ============= Adding Tags Tests =============

  describe('Adding Tags', () => {
    it('should show input when not readonly', () => {
      hostComponent.readonly = false;
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector('.tag-input');
      expect(input).toBeTruthy();
    });

    it('should display custom placeholder', () => {
      hostComponent.placeholder = 'Type here...';
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector('.tag-input');
      expect(input.placeholder).toBe('Type here...');
    });

    it('should add tag on Enter key', () => {
      const input = hostFixture.nativeElement.querySelector('.tag-input');
      input.value = 'newtag';
      component['newTagValue'] = 'newtag';

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.addTag(event);
      hostFixture.detectChanges();

      expect(hostComponent.changedTags).toContain('newtag');
    });

    it('should add tag on comma key', () => {
      component['newTagValue'] = 'anothertag';

      const event = new KeyboardEvent('keydown', { key: ',' });
      component.addTag(event);
      hostFixture.detectChanges();

      expect(hostComponent.changedTags).toContain('anothertag');
    });

    it('should trim whitespace from new tags', () => {
      component['newTagValue'] = '  spacedtag  ';

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.addTag(event);
      hostFixture.detectChanges();

      expect(hostComponent.changedTags).toContain('spacedtag');
    });

    it('should remove commas from tag value', () => {
      component['newTagValue'] = 'tag,with,commas';

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.addTag(event);
      hostFixture.detectChanges();

      expect(hostComponent.changedTags).toContain('tagwithcommas');
    });

    it('should not add empty tags', () => {
      component['newTagValue'] = '   ';

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.addTag(event);
      hostFixture.detectChanges();

      expect(hostComponent.changedTags).toBeNull();
    });

    it('should not add duplicate tags', () => {
      hostComponent.tags = ['existing'];
      hostFixture.detectChanges();

      component['newTagValue'] = 'existing';

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.addTag(event);
      hostFixture.detectChanges();

      // Should still only have one 'existing' tag
      const chips = hostFixture.nativeElement.querySelectorAll('.tag-chip');
      expect(chips.length).toBe(1);
    });

    it('should clear input after adding tag', () => {
      component['newTagValue'] = 'newtag';

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.addTag(event);

      expect(component['newTagValue']).toBe('');
    });
  });

  // ============= Max Tags Tests =============

  describe('Max Tags Limit', () => {
    it('should allow adding when under limit', () => {
      hostComponent.tags = ['tag1', 'tag2'];
      hostComponent.maxTags = 5;
      hostFixture.detectChanges();

      expect(component.canAddMore()).toBe(true);
    });

    it('should prevent adding when at limit', () => {
      hostComponent.tags = ['tag1', 'tag2', 'tag3'];
      hostComponent.maxTags = 3;
      hostFixture.detectChanges();

      expect(component.canAddMore()).toBe(false);
    });

    it('should hide input when at max tags', () => {
      hostComponent.tags = ['tag1', 'tag2', 'tag3'];
      hostComponent.maxTags = 3;
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector('.tag-input');
      expect(input).toBeNull();
    });

    it('should allow unlimited tags when maxTags is 0', () => {
      hostComponent.tags = ['t1', 't2', 't3', 't4', 't5', 't6', 't7'];
      hostComponent.maxTags = 0;
      hostFixture.detectChanges();

      expect(component.canAddMore()).toBe(true);
    });

    it('should not add tag when at max limit', () => {
      hostComponent.tags = ['tag1', 'tag2', 'tag3'];
      hostComponent.maxTags = 3;
      hostFixture.detectChanges();

      component['newTagValue'] = 'newtag';
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.addTag(event);
      hostFixture.detectChanges();

      expect(hostComponent.tags.length).toBe(3);
    });
  });

  // ============= Removing Tags Tests =============

  describe('Removing Tags', () => {
    it('should show remove button for each tag', () => {
      hostComponent.tags = ['tag1', 'tag2'];
      hostFixture.detectChanges();

      const removeButtons = hostFixture.nativeElement.querySelectorAll('.tag-remove');
      expect(removeButtons.length).toBe(2);
    });

    it('should remove tag when remove button clicked', () => {
      hostComponent.tags = ['tag1', 'tag2', 'tag3'];
      hostFixture.detectChanges();

      component.removeTag('tag2');
      hostFixture.detectChanges();

      expect(hostComponent.changedTags).toEqual(['tag1', 'tag3']);
    });

    it('should emit updated tags array after removal', () => {
      hostComponent.tags = ['only-tag'];
      hostFixture.detectChanges();

      component.removeTag('only-tag');
      hostFixture.detectChanges();

      expect(hostComponent.changedTags).toEqual([]);
    });
  });

  // ============= Readonly Mode Tests =============

  describe('Readonly Mode', () => {
    beforeEach(() => {
      hostComponent.readonly = true;
      hostComponent.tags = ['tag1', 'tag2'];
      hostFixture.detectChanges();
    });

    it('should hide input when readonly', () => {
      const input = hostFixture.nativeElement.querySelector('.tag-input');
      expect(input).toBeNull();
    });

    it('should hide remove buttons when readonly', () => {
      const removeButtons = hostFixture.nativeElement.querySelectorAll('.tag-remove');
      expect(removeButtons.length).toBe(0);
    });

    it('should display tags without controls', () => {
      const chips = hostFixture.nativeElement.querySelectorAll('.tag-chip');
      expect(chips.length).toBe(2);
    });

    it('should apply readonly class to container', () => {
      const container = hostFixture.nativeElement.querySelector('.tags-input-container');
      expect(container.classList.contains('readonly')).toBe(true);
    });
  });

  // ============= Computed Property Tests =============

  describe('Computed Properties', () => {
    it('canAddMore should return true when below max', () => {
      hostComponent.tags = ['tag1'];
      hostComponent.maxTags = 3;
      hostFixture.detectChanges();

      expect(component.canAddMore()).toBe(true);
    });

    it('canAddMore should return false when at max', () => {
      hostComponent.tags = ['tag1', 'tag2', 'tag3'];
      hostComponent.maxTags = 3;
      hostFixture.detectChanges();

      expect(component.canAddMore()).toBe(false);
    });

    it('canAddMore should return true with unlimited (maxTags = 0)', () => {
      hostComponent.tags = ['t1', 't2', 't3', 't4', 't5'];
      hostComponent.maxTags = 0;
      hostFixture.detectChanges();

      expect(component.canAddMore()).toBe(true);
    });
  });

  // ============= Accessibility Tests =============

  describe('Accessibility', () => {
    it('should have aria-label on input', () => {
      hostComponent.placeholder = 'Add new tag';
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector('.tag-input');
      expect(input.getAttribute('aria-label')).toBe('Add new tag');
    });

    it('should have aria-label on remove buttons', () => {
      hostComponent.tags = ['important'];
      hostFixture.detectChanges();

      const removeBtn = hostFixture.nativeElement.querySelector('.tag-remove');
      expect(removeBtn.getAttribute('aria-label')).toBe('Remove tag important');
    });
  });
});
