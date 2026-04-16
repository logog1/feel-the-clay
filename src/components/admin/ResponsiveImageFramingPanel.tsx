import { useEffect, useMemo, useState } from "react";
import { Monitor, MoveHorizontal, MoveVertical, Smartphone, ZoomIn, Crop } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  getFrameClasses,
  getMediaPresentationStyle,
  getViewportAspectRatio,
  getViewportLayout,
  type FrameStyle,
  type MediaDevice,
  type MediaLayoutSettings,
  type MediaPreviewContext,
} from "@/lib/media-layout";

interface FramingConfig {
  id: string;
  title: string;
  description: string;
  previewContext: MediaPreviewContext;
  settings: MediaLayoutSettings;
}

interface ResponsiveImageFramingPanelProps {
  imageUrl: string;
  frame: FrameStyle;
  configs: FramingConfig[];
  onChange: (layoutId: string, nextLayout: MediaLayoutSettings) => void;
}

function WebsitePreview({
  imageUrl,
  previewContext,
  frame,
  device,
  layout,
  active,
  onSelect,
}: {
  imageUrl: string;
  previewContext: MediaPreviewContext;
  frame: FrameStyle;
  device: MediaDevice;
  layout: MediaLayoutSettings;
  active: boolean;
  onSelect: (device: MediaDevice) => void;
}) {
  const isPhone = device === "phone";
  const frameClasses = getFrameClasses(frame);
  const imageStyle = getMediaPresentationStyle(getViewportLayout(layout, device));
  const aspectRatio = getViewportAspectRatio(layout, device, previewContext === "card" ? 4 / 3 : 16 / 9);

  if (previewContext === "hero") {
    return (
      <button
        type="button"
        onClick={() => onSelect(device)}
        className={cn(
          "flex-shrink-0 space-y-1.5 rounded-2xl p-2 text-start transition-colors",
          active ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30"
        )}
      >
        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          {isPhone ? <Smartphone size={10} /> : <Monitor size={10} />}
          {isPhone ? "Phone" : "Desktop"}
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-[hsl(var(--background))]" style={{ width: isPhone ? 190 : 360 }}>
          <div className="absolute inset-0 overflow-hidden" style={{ aspectRatio }}>
            <div className={cn("w-full h-full overflow-hidden", frameClasses)}>
              <img src={imageUrl} alt="Preview" className="w-full h-full" style={imageStyle} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/80" />
          </div>
          <div className="relative z-10 aspect-[16/9] px-3 py-2" style={{ aspectRatio }}>
            <div className="flex items-center justify-between">
              <div className="w-5 h-5 rounded-md bg-primary/80" />
              {!isPhone && (
                <div className="flex gap-2">
                  {["Home", "About", "Workshops"].map((label) => (
                    <span key={label} className="text-[7px] text-foreground/70">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex h-full flex-col justify-center px-1">
              <div className="space-y-1.5">
                <div className={cn("font-bold text-foreground drop-shadow-sm", isPhone ? "text-sm" : "text-lg")}>
                  Rethinking pottery
                </div>
                <div className={cn("font-bold text-foreground drop-shadow-sm", isPhone ? "text-sm" : "text-lg")}>
                  as <span className="relative">community<span className="absolute -bottom-0.5 left-0 w-full h-0.5 rounded-full bg-primary" /></span>
                </div>
                <div className={cn("text-foreground/60", isPhone ? "text-[8px]" : "text-[10px]")}>A creative, grounding experience</div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(device)}
      className={cn(
        "flex-shrink-0 space-y-1.5 rounded-2xl p-2 text-start transition-colors",
        active ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30"
      )}
    >
      <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        {isPhone ? <Smartphone size={10} /> : <Monitor size={10} />}
        {isPhone ? "Phone" : "Desktop"}
      </div>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card" style={{ width: isPhone ? 190 : 320 }}>
        <div className={cn("relative overflow-hidden", frameClasses)} style={{ aspectRatio }}>
          <img src={imageUrl} alt="Preview" className="w-full h-full" style={imageStyle} />
        </div>
        <div className="space-y-1 p-2">
          <div className={cn("font-semibold text-foreground", isPhone ? "text-[10px]" : "text-xs")}>Workshop Name</div>
          <div className={cn("text-muted-foreground", isPhone ? "text-[8px]" : "text-[9px]")}>Duration • Participants</div>
          <div className="mt-1 flex gap-1">
            <div className="flex h-4 items-center rounded-md bg-primary/10 px-2 text-[8px] text-primary">Book</div>
          </div>
        </div>
      </div>
    </button>
  );
}

export function ResponsiveImageFramingPanel({ imageUrl, frame, configs, onChange }: ResponsiveImageFramingPanelProps) {
  const [activeConfigId, setActiveConfigId] = useState(configs[0]?.id ?? "");
  const [activeDevice, setActiveDevice] = useState<MediaDevice>("phone");

  useEffect(() => {
    if (!configs.some((config) => config.id === activeConfigId)) {
      setActiveConfigId(configs[0]?.id ?? "");
    }
  }, [activeConfigId, configs]);

  const activeConfig = useMemo(
    () => configs.find((config) => config.id === activeConfigId) ?? configs[0],
    [activeConfigId, configs]
  );

  if (!activeConfig) return null;

  const activeViewport = getViewportLayout(activeConfig.settings, activeDevice);

  const updateViewport = (nextPartial: Partial<typeof activeViewport>) => {
    onChange(activeConfig.id, {
      ...activeConfig.settings,
      [activeDevice]: {
        ...activeViewport,
        ...nextPartial,
      },
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/30 bg-muted/30 p-4 animate-fade-up">
      <div className="space-y-1">
        <h6 className="text-sm font-semibold text-foreground">Phone & desktop framing</h6>
        <p className="text-xs text-muted-foreground">Adjust ratio, zoom, and position for the exact website slots below. Phone and desktop save separately.</p>
      </div>

      {configs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {configs.map((config) => (
            <button
              key={config.id}
              type="button"
              onClick={() => setActiveConfigId(config.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                config.id === activeConfig.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {config.title}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border/30 bg-background/80 p-3">
        <div className="mb-3">
          <div className="text-sm font-medium text-foreground">{activeConfig.title}</div>
          <p className="text-xs text-muted-foreground">{activeConfig.description}</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <WebsitePreview
            imageUrl={imageUrl}
            previewContext={activeConfig.previewContext}
            frame={frame}
            device="phone"
            layout={activeConfig.settings}
            active={activeDevice === "phone"}
            onSelect={setActiveDevice}
          />
          <WebsitePreview
            imageUrl={imageUrl}
            previewContext={activeConfig.previewContext}
            frame={frame}
            device="desktop"
            layout={activeConfig.settings}
            active={activeDevice === "desktop"}
            onSelect={setActiveDevice}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/30 bg-background/80 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-foreground">Editing {activeDevice === "phone" ? "Phone" : "Desktop"}</div>
            <p className="text-xs text-muted-foreground">Click either preview above to switch the device you are editing.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-muted/60 p-1">
            {([
              { value: "phone", label: "Phone", icon: Smartphone },
              { value: "desktop", label: "Desktop", icon: Monitor },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveDevice(value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  activeDevice === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Crop size={13} className="text-primary" />
              Ratio: {activeViewport.ratio.toFixed(2)}
            </label>
            <Slider
              value={[activeViewport.ratio]}
              min={0.7}
              max={2.4}
              step={0.01}
              onValueChange={([ratio]) => updateViewport({ ratio })}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
              <ZoomIn size={13} className="text-primary" />
              Zoom: {Math.round(activeViewport.zoom * 100)}%
            </label>
            <Slider
              value={[activeViewport.zoom]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={([zoom]) => updateViewport({ zoom })}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
              <MoveHorizontal size={13} className="text-primary" />
              Horizontal focus: {Math.round(activeViewport.x)}%
            </label>
            <Slider
              value={[activeViewport.x]}
              min={0}
              max={100}
              step={1}
              onValueChange={([x]) => updateViewport({ x })}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
              <MoveVertical size={13} className="text-primary" />
              Vertical focus: {Math.round(activeViewport.y)}%
            </label>
            <Slider
              value={[activeViewport.y]}
              min={0}
              max={100}
              step={1}
              onValueChange={([y]) => updateViewport({ y })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
