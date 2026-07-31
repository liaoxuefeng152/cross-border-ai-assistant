'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Bot,
  Brain,
  Code2,
  Hexagon,
  FileText,
  ChevronDown,
  Check,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getAvailableModelsSync, findModelById, initModels, type ModelInfo } from '@/lib/models';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Zap,
  Bot,
  Brain,
  Code2,
  Hexagon,
  FileText,
};

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  className?: string;
}

function ModelIcon({ model, className }: { model: ModelInfo; className?: string }) {
  const Icon = model.icon ? iconMap[model.icon] : Cpu;
  const color = model.color || 'currentColor';
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-md', className)}
      style={{ color }}
    >
      {Icon ? <Icon className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
    </span>
  );
}

export function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>(getAvailableModelsSync());
  const selected = useMemo(() => findModelById(value) || findModelById('auto')!, [value]);

  useEffect(() => {
    initModels().then(() => setModels(getAvailableModelsSync()));
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground',
            className
          )}
        >
          <ModelIcon model={selected} />
          <span>{selected.name}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-80 p-0"
      >
        <div className="border-b px-3 py-2.5">
          <h4 className="text-sm font-medium">选择模型</h4>
          <p className="text-xs text-muted-foreground">不同模型擅长不同任务，Auto 会自动匹配</p>
        </div>
        <ScrollArea className="h-80">
          <div className="p-1.5">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onChange(model.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent',
                  selected.id === model.id && 'bg-accent'
                )}
              >
                <ModelIcon model={model} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{model.name}</span>
                    {model.tags?.map((tag) => (
                      <Badge
                        key={tag.text}
                        variant={tag.variant}
                        className="h-4 px-1 text-[10px] font-normal"
                      >
                        {tag.text}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {model.costMultiplier.toFixed(2)}x
                  </span>
                  {selected.id === model.id && <Check className="h-4 w-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
