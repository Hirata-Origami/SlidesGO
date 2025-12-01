import pptxgen from 'pptxgenjs';
import { Slide, SlideElement } from '@/types';
import { getTheme } from '@/lib/themes';

export const generatePPTX = async (slides: Slide[], fileName: string) => {
    const pres = new pptxgen();

    // Helper to convert px to percentage string for PPTX (assuming 1024x576 base)
    const pxToPct = (val: number, base: number) => {
        return `${(val / base) * 100}%`;
    };

    for (const slide of slides) {
        const pptSlide = pres.addSlide();
        const theme = getTheme(slide.themeId);

        // Background
        if (slide.backgroundImage) {
            try {
                pptSlide.background = { path: slide.backgroundImage };
            } catch (e) {
                console.error("Failed to set background image", e);
                pptSlide.background = { color: theme.backgroundColor.replace('#', '') };
            }
        } else {
            pptSlide.background = { color: theme.backgroundColor.replace('#', '') };
        }

        // Elements
        for (const element of slide.elements) {
            const x = pxToPct(element.x, 1024); // Assuming editor width is approx 1024
            const y = pxToPct(element.y, 576);  // Assuming editor height is approx 576
            const w = pxToPct(element.width, 1024);
            const h = pxToPct(element.height, 576);

            if (element.type === 'text') {
                const color = element.style?.color ? element.style.color.toString().replace('#', '') : theme.textColor.replace('#', '');
                const fontSize = element.style?.fontSize ? parseInt(element.style.fontSize.toString()) : 18;
                const bold = element.style?.fontWeight === 'bold';
                const italic = element.style?.fontStyle === 'italic';
                const align = element.style?.textAlign as 'left' | 'center' | 'right' || 'left';

                pptSlide.addText(element.content, {
                    x: x as any, y: y as any, w: w as any, h: h as any,
                    align: align,
                    color: color,
                    fontSize: fontSize,
                    bold: bold,
                    italic: italic,
                    // bullet: true // Optional: make configurable
                });
            } else if (element.type === 'image') {
                if (element.content) {
                    try {
                        pptSlide.addImage({
                            path: element.content,
                            x: x as any, y: y as any, w: w as any, h: h as any
                        });
                    } catch (e) {
                        console.error("Failed to add image to PPT", e);
                    }
                }
            }
        }
    }

    pres.writeFile({ fileName });
};
