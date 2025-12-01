export type ElementType = 'text' | 'image';

export interface SlideElement {
    id: string;
    type: ElementType;
    content: string; // Text content or Image URL
    x: number;
    y: number;
    width: number;
    height: number;
    style?: React.CSSProperties;
}

export interface Slide {
    id: string;
    elements: SlideElement[];
    backgroundImage?: string;
    notes?: string;
    themeId?: string;
    layout?: string; // Keep track of original layout intent
    isGenerating?: boolean; // For loading states
}

export interface Theme {
    id: string;
    name: string;
    fontFamily: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    gradient?: string; // Optional CSS gradient background
}
