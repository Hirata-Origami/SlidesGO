import { SlideElement } from '@/types';

export interface Layout {
    id: string;
    name: string;
    elements: Omit<SlideElement, 'id'>[]; // Template elements without IDs
}

export const layouts: Layout[] = [
    {
        id: 'title',
        name: 'Title Slide',
        elements: [
            { type: 'text', content: 'Title', x: 50, y: 200, width: 924, height: 100, style: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center' } },
            { type: 'text', content: 'Subtitle', x: 150, y: 320, width: 724, height: 60, style: { fontSize: '24px', textAlign: 'center', color: 'rgba(0,0,0,0.6)' } }
        ]
    },
    {
        id: 'content',
        name: 'Title & Content',
        elements: [
            { type: 'text', content: 'Slide Title', x: 50, y: 40, width: 924, height: 80, style: { fontSize: '36px', fontWeight: 'bold' } },
            { type: 'text', content: 'Click to add content...', x: 50, y: 140, width: 924, height: 400, style: { fontSize: '18px', textAlign: 'left' } }
        ]
    },
    {
        id: 'two-column',
        name: 'Two Columns',
        elements: [
            { type: 'text', content: 'Slide Title', x: 50, y: 40, width: 924, height: 80, style: { fontSize: '36px', fontWeight: 'bold' } },
            { type: 'text', content: 'Left Column', x: 50, y: 140, width: 440, height: 400, style: { fontSize: '18px' } },
            { type: 'text', content: 'Right Column', x: 530, y: 140, width: 440, height: 400, style: { fontSize: '18px' } }
        ]
    },
    {
        id: 'three-column',
        name: 'Three Columns',
        elements: [
            { type: 'text', content: 'Slide Title', x: 50, y: 40, width: 924, height: 80, style: { fontSize: '36px', fontWeight: 'bold' } },
            { type: 'text', content: 'Column 1', x: 50, y: 140, width: 290, height: 400, style: { fontSize: '16px' } },
            { type: 'text', content: 'Column 2', x: 365, y: 140, width: 290, height: 400, style: { fontSize: '16px' } },
            { type: 'text', content: 'Column 3', x: 680, y: 140, width: 290, height: 400, style: { fontSize: '16px' } }
        ]
    },
    {
        id: 'image-left',
        name: 'Image Left',
        elements: [
            { type: 'text', content: 'Slide Title', x: 50, y: 40, width: 924, height: 80, style: { fontSize: '36px', fontWeight: 'bold' } },
            { type: 'image', content: '', x: 50, y: 140, width: 440, height: 400, style: {} },
            { type: 'text', content: 'Content', x: 530, y: 140, width: 440, height: 400, style: { fontSize: '18px' } }
        ]
    },
    {
        id: 'image-right',
        name: 'Image Right',
        elements: [
            { type: 'text', content: 'Slide Title', x: 50, y: 40, width: 924, height: 80, style: { fontSize: '36px', fontWeight: 'bold' } },
            { type: 'text', content: 'Content', x: 50, y: 140, width: 440, height: 400, style: { fontSize: '18px' } },
            { type: 'image', content: '', x: 530, y: 140, width: 440, height: 400, style: {} }
        ]
    },
    {
        id: 'grid',
        name: 'Grid (4 Quadrants)',
        elements: [
            { type: 'text', content: 'Top Left', x: 50, y: 50, width: 440, height: 220, style: { fontSize: '18px' } },
            { type: 'text', content: 'Top Right', x: 530, y: 50, width: 440, height: 220, style: { fontSize: '18px' } },
            { type: 'text', content: 'Bottom Left', x: 50, y: 300, width: 440, height: 220, style: { fontSize: '18px' } },
            { type: 'text', content: 'Bottom Right', x: 530, y: 300, width: 440, height: 220, style: { fontSize: '18px' } }
        ]
    },
    {
        id: 'caption-bottom',
        name: 'Big Image & Caption',
        elements: [
            { type: 'image', content: '', x: 0, y: 0, width: 1024, height: 450, style: {} },
            { type: 'text', content: 'Caption Text', x: 50, y: 470, width: 924, height: 80, style: { fontSize: '24px', textAlign: 'center' } }
        ]
    },
    {
        id: 'table',
        name: 'Table (3x3)',
        elements: [
            { type: 'text', content: 'Header 1', x: 50, y: 100, width: 300, height: 50, style: { fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.1)' } },
            { type: 'text', content: 'Header 2', x: 360, y: 100, width: 300, height: 50, style: { fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.1)' } },
            { type: 'text', content: 'Header 3', x: 670, y: 100, width: 300, height: 50, style: { fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.1)' } },

            { type: 'text', content: 'Row 1, Col 1', x: 50, y: 160, width: 300, height: 50, style: { textAlign: 'center', border: '1px solid #ccc' } },
            { type: 'text', content: 'Row 1, Col 2', x: 360, y: 160, width: 300, height: 50, style: { textAlign: 'center', border: '1px solid #ccc' } },
            { type: 'text', content: 'Row 1, Col 3', x: 670, y: 160, width: 300, height: 50, style: { textAlign: 'center', border: '1px solid #ccc' } },

            { type: 'text', content: 'Row 2, Col 1', x: 50, y: 220, width: 300, height: 50, style: { textAlign: 'center', border: '1px solid #ccc' } },
            { type: 'text', content: 'Row 2, Col 2', x: 360, y: 220, width: 300, height: 50, style: { textAlign: 'center', border: '1px solid #ccc' } },
            { type: 'text', content: 'Row 2, Col 3', x: 670, y: 220, width: 300, height: 50, style: { textAlign: 'center', border: '1px solid #ccc' } }
        ]
    }
];

export const getLayout = (id?: string) => layouts.find(l => l.id === id) || layouts[1];
