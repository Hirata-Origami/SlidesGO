import { RefreshCw, Image as ImageIcon, GripHorizontal, MessageSquarePlus, Play, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Slide, SlideElement } from '@/types';
import { getTheme } from '@/lib/themes';

interface SlidePreviewProps {
    slide: Slide;
    index: number;
    isActive: boolean;
    onUpdateElement: (elementId: string, field: string, value: any) => void;
    onSelectElement?: (elementId: string | null) => void;
    onSetBackground?: (image: string) => void;
    selectedElementId?: string | null;
    scale?: number; // For scaling the preview in the sidebar
}

export default function SlidePreview({
    slide,
    index,
    isActive,
    onUpdateElement,
    onSelectElement,
    onSetBackground,
    selectedElementId,
    scale = 1
}: SlidePreviewProps) {

    const theme = getTheme(slide.themeId);

    // Base dimensions for the slide
    const BASE_WIDTH = 1024;
    const BASE_HEIGHT = 576;

    return (
        <div
            className="relative overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/5 transition-all bg-white"
            style={{
                width: '100%',
                height: '100%',
                aspectRatio: '16/9'
            }}
            onClick={() => onSelectElement?.(null)}
        >
            {/* Scaled Container */}
            <div
                style={{
                    width: BASE_WIDTH,
                    height: BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    backgroundColor: theme.backgroundColor,
                    backgroundImage: theme.gradient || (slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    fontFamily: theme.fontFamily,
                    color: theme.textColor,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: isActive ? 'auto' : 'none' // Disable interaction in sidebar
                }}
            >
                {/* Elements */}
                {slide.elements.map((element) => (
                    <Rnd
                        key={element.id}
                        size={{ width: element.width, height: element.height }}
                        position={{ x: element.x, y: element.y }}
                        onDragStop={(e, d) => onUpdateElement(element.id, 'position', { x: d.x, y: d.y })}
                        onResizeStop={(e, direction, ref, delta, position) => {
                            onUpdateElement(element.id, 'size', {
                                width: parseInt(ref.style.width),
                                height: parseInt(ref.style.height),
                                ...position
                            });
                        }}
                        bounds="parent"
                        scale={isActive ? 1 : scale} // Rnd needs to know the scale if active, but here we scale the parent
                        disableDragging={!isActive}
                        enableResizing={isActive ? undefined : false}
                        className={`z-10 ${selectedElementId === element.id && isActive ? 'ring-2 ring-purple-500 rounded' : ''}`}
                        onClick={(e: { stopPropagation: () => void; }) => {
                            if (!isActive) return;
                            e.stopPropagation();
                            onSelectElement?.(element.id);
                        }}
                    >
                        <div className="w-full h-full cursor-move">
                            {element.type === 'text' ? (
                                <textarea
                                    value={element.content}
                                    onChange={(e) => onUpdateElement(element.id, 'content', e.target.value)}
                                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none overflow-hidden p-2"
                                    style={{
                                        color: element.style?.color || theme.textColor,
                                        fontSize: element.style?.fontSize || '18px',
                                        fontWeight: element.style?.fontWeight || 'normal',
                                        fontStyle: element.style?.fontStyle || 'normal',
                                        textAlign: element.style?.textAlign as any || 'left',
                                        ...element.style
                                    }}
                                    placeholder="Type here..."
                                    readOnly={!isActive}
                                />
                            ) : (
                                <div
                                    className="w-full h-full relative group"
                                    onDoubleClick={() => {
                                        if (isActive && element.content && onSetBackground) {
                                            onSetBackground(element.content);
                                        }
                                    }}
                                    title="Double click to set as background"
                                >
                                    {element.content ? (
                                        <img src={element.content} alt="Slide element" className="w-full h-full object-cover rounded-lg pointer-events-none" />
                                    ) : (
                                        <div className="w-full h-full bg-black/5 border-2 border-dashed border-black/10 flex items-center justify-center rounded-lg">
                                            <ImageIcon className="w-16 h-16 text-black/20" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Rnd>
                ))}
            </div>
        </div>
    );
}
