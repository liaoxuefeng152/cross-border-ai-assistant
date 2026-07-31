"use client";

// ============================================================
// 浏览器控制面板 - 快捷操作按钮
// ============================================================

import { useState, useCallback } from "react";
import {
  MousePointerClick,
  Keyboard,
  ArrowDown,
  Camera,
  Table2,
  Clock,
  ScrollText,
  Search,
  ShoppingBag,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BrowserControlsProps {
  onAction: (action: string, params: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function BrowserControls({ onAction, disabled }: BrowserControlsProps) {
  const [clickSelector, setClickSelector] = useState("");
  const [typeText, setTypeText] = useState("");
  const [typeSelector, setTypeSelector] = useState("");
  const [extractSelector, setExtractSelector] = useState("");

  const handleClick = useCallback(() => {
    if (clickSelector.trim()) {
      onAction("click", { selector: clickSelector.trim() });
    }
  }, [clickSelector, onAction]);

  const handleType = useCallback(() => {
    if (typeSelector.trim() && typeText) {
      onAction("type", { selector: typeSelector.trim(), text: typeText });
    }
  }, [typeSelector, typeText, onAction]);

  return (
    <div className="space-y-3 p-3">
      {/* 快捷操作 */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          快捷操作
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs h-8"
            disabled={disabled}
            onClick={() => onAction("screenshot", {})}
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            截图
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs h-8"
            disabled={disabled}
            onClick={() => onAction("scroll", { toBottom: true })}
          >
            <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
            滚到底部
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs h-8"
            disabled={disabled}
            onClick={() => onAction("wait", { duration: 2000 })}
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            等待 2 秒
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs h-8"
            disabled={disabled}
            onClick={() => onAction("press", { key: "Escape" })}
          >
            <Keyboard className="h-3.5 w-3.5 mr-1.5" />
            按 Esc
          </Button>
        </div>
      </div>

      {/* 数据提取 */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          数据提取
        </p>
        <div className="flex gap-1.5">
          <Input
            value={extractSelector}
            onChange={(e) => setExtractSelector(e.target.value)}
            placeholder="CSS 选择器"
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs h-8"
                disabled={disabled || !extractSelector.trim()}
              >
                <Search className="h-3.5 w-3.5 mr-1.5" />
                提取文本
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem
                onClick={() =>
                  onAction("extract", {
                    mode: "text",
                    selector: extractSelector,
                  })
                }
              >
                <ScrollText className="h-3.5 w-3.5 mr-2" />
                提取文本
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onAction("extract", {
                    mode: "html",
                    selector: extractSelector,
                  })
                }
              >
                <Table2 className="h-3.5 w-3.5 mr-2" />
                提取 HTML
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onAction("extract", {
                    mode: "product",
                    selector: extractSelector,
                  })
                }
              >
                <Package className="h-3.5 w-3.5 mr-2" />
                提取商品信息
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onAction("extract", {
                    mode: "order",
                    selector: extractSelector,
                  })
                }
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                提取订单信息
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs h-8"
            disabled={disabled || !extractSelector.trim()}
            onClick={() =>
              onAction("extract", {
                mode: "table",
                selector: extractSelector,
              })
            }
          >
            <Table2 className="h-3.5 w-3.5 mr-1.5" />
            提取表格
          </Button>
        </div>
      </div>

      {/* 点击操作 */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          点击操作
        </p>
        <div className="flex gap-1.5">
          <Input
            value={clickSelector}
            onChange={(e) => setClickSelector(e.target.value)}
            placeholder="CSS 选择器，如 button.login"
            className="h-8 text-xs flex-1"
            disabled={disabled}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs shrink-0"
            disabled={disabled || !clickSelector.trim()}
            onClick={handleClick}
          >
            <MousePointerClick className="h-3.5 w-3.5 mr-1" />
            点击
          </Button>
        </div>
      </div>

      {/* 输入操作 */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          文本输入
        </p>
        <Input
          value={typeSelector}
          onChange={(e) => setTypeSelector(e.target.value)}
          placeholder="目标选择器，如 input#email"
          className="h-8 text-xs"
          disabled={disabled}
        />
        <div className="flex gap-1.5">
          <Input
            value={typeText}
            onChange={(e) => setTypeText(e.target.value)}
            placeholder="输入内容"
            className="h-8 text-xs flex-1"
            disabled={disabled}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs shrink-0"
            disabled={disabled || !typeSelector.trim() || !typeText.trim()}
            onClick={handleType}
          >
            <Keyboard className="h-3.5 w-3.5 mr-1" />
            输入
          </Button>
        </div>
      </div>
    </div>
  );
}
