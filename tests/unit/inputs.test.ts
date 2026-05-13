import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TextInput from '~/components/ui/TextInput.astro';
import Textarea from '~/components/ui/Textarea.astro';
import SegmentedControl from '~/components/ui/SegmentedControl.astro';
import Dropdown from '~/components/ui/Dropdown.astro';

describe('TextInput', () => {
  it('renders a label associated to the input by id', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TextInput, {
      props: { name: 'name', label: 'Your name', required: true },
    });
    expect(html).toMatch(/<label[^>]*for="name"/);
    expect(html).toMatch(/<input[^>]*id="name"[^>]*name="name"[^>]*required/);
    expect(html).toContain('Your name');
  });

  it('renders an error message and sets aria-invalid', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TextInput, {
      props: { name: 'email', label: 'Email', error: 'Invalid format' },
    });
    expect(html).toContain('Invalid format');
    expect(html).toMatch(/aria-invalid="true"/);
  });
});

describe('Textarea', () => {
  it('renders a textarea with rows and label', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Textarea, {
      props: { name: 'msg', label: 'Project details', rows: 5 },
    });
    expect(html).toMatch(/<textarea[^>]*rows="5"/);
    expect(html).toContain('Project details');
  });
});

describe('SegmentedControl', () => {
  it('renders a radio group with the provided options', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SegmentedControl, {
      props: {
        name: 'propertyType',
        label: 'Property type',
        options: [
          { value: 'detached', label: 'Detached' },
          { value: 'semi', label: 'Semi-detached' },
        ],
      },
    });
    expect(html).toMatch(/<input[^>]+type="radio"[^>]+name="propertyType"[^>]+value="detached"/);
    expect(html).toContain('Semi-detached');
  });
});

describe('Dropdown', () => {
  it('renders a select element with options including a default empty option', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Dropdown, {
      props: {
        name: 'budget',
        label: 'Budget',
        options: [
          { value: '', label: 'Select…' },
          { value: 'under-25k', label: 'Under $25K' },
        ],
      },
    });
    expect(html).toMatch(/<select[^>]+name="budget"/);
    expect(html).toContain('Under $25K');
  });
});
