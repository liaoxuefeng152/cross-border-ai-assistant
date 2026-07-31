"use client";

// ============================================================
// 浏览器视图组件 - 显示浏览器截图和控制界面
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Monitor,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Home,
  Loader2,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  MousePointerClick,
  Keyboard,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BrowserControls } from "./browser-controls";

export interface BrowserViewState {
  sessionId: string | null;
  status: "disconnected" | "connecting" | "connected" | "running" | "error";
  currentUrl: string | null;
  screenshot: string | null;
  error: string | null;
  history: string[];
}

interface BrowserViewProps {
  className?: string;
  onActionComplete?: (result: unknown) => void;
}

export function BrowserView({ className, onActionComplete }: BrowserViewProps) {
  const [state, setState] = useState<BrowserViewState>({
    sessionId: null,
    status: "disconnected",
    currentUrl: null,
    screenshot: null,
    error: null,
    history: [],
  });
  const [urlInput, setUrlInput] = useState("");
  const [zoom, setZoom] = useState(1);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 断开连接时清理
  useEffect(() => {
    return () => {
      if (state.sessionId) {
        fetch("/api/browser/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: state.sessionId }),
        }).catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 启动浏览器
  const launch = useCallback(async (url?: string) => {
    setState((prev) => ({ ...prev, status: "connecting", error: null }));

    try {
      const res = await fetch("/api/browser/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "default" },
        body: JSON.stringify({ url, headless: false }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "启动失败");
      }

      setState((prev) => ({
        ...prev,
        sessionId: data.session.id,
        status: data.session.status === "error" ? "error" : "connected",
        currentUrl: data.session.currentUrl,
        screenshot: data.session.screenshot || null,
        error: data.session.error || null,
        history: data.session.currentUrl ? [data.session.currentUrl] : [],
      }));

      setUrlInput(data.session.currentUrl || "");
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "启动失败",
      }));
    }
  }, []);

  // 执行操作
  const executeAction = useCallback(
    async (action: string, params: Record<string, unknown> = {}) => {
      if (!state.sessionId) return null;

      setState((prev) => ({ ...prev, status: "running", error: null }));

      try {
        const res = await fetch("/api/browser/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: state.sessionId, action, params }),
        });
        const data = await res.json();

        if (!data.success) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: data.error || "操作失败",
          }));
          onActionComplete?.(data);
          return data;
        }

        setState((prev) => {
          const newUrl = data.currentUrl || prev.currentUrl;
          const newHistory =
            action === "navigate" && newUrl !== prev.history[prev.history.length - 1]
              ? [...prev.history, newUrl]
              : prev.history;

          return {
            ...prev,
            status: "connected",
            currentUrl: newUrl,
            screenshot: data.screenshot || prev.screenshot,
            history: newHistory,
          };
        });

        setUrlInput(data.currentUrl || state.currentUrl || "");
        onActionComplete?.(data);
        return data;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "操作失败",
        }));
        return null;
      }
    },
    [state.sessionId, state.currentUrl, onActionComplete]
  );

  // 导航到 URL
  const navigateTo = useCallback(
    async (url: string) => {
      if (!url) return;
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      setUrlInput(normalizedUrl);
      await executeAction("navigate", { url: normalizedUrl });
    },
    [executeAction]
  );

  // 刷新当前页面
  const refresh = useCallback(async () => {
    if (state.currentUrl) {
      await executeAction("navigate", { url: state.currentUrl });
    }
  }, [state.currentUrl, executeAction]);

  // 截图
  const takeScreenshot = useCallback(async () => {
    await executeAction("screenshot");
  }, [executeAction]);

  // 关闭浏览器
  const closeBrowser = useCallback(async () => {
    if (!state.sessionId) return;

    await fetch("/api/browser/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: state.sessionId }),
    }).catch(() => {});

    setState({
      sessionId: null,
      status: "disconnected",
      currentUrl: null,
      screenshot: null,
      error: null,
      history: [],
    });
    setUrlInput("");
  }, [state.sessionId]);

  // 下载截图
  const downloadScreenshot = useCallback(() => {
    if (!state.screenshot) return;
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${state.screenshot}`;
    link.download = `screenshot-${Date.now()}.jpg`;
    link.click();
  }, [state.screenshot]);

  const isConnected = state.sessionId !== null && state.status !== "disconnected";
  const isRunning = state.status === "running";

  return (
    <div className={cn("flex flex-col h-full", className)} ref={containerRef}>
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-white shrink-0">
        {/* 导航按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={!isConnected}
          onClick={() => {
            /* TODO: go back */
          }}
          title="后退"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={!isConnected}
          onClick={() => {
            /* TODO: go forward */
          }}
          title="前进"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={!isConnected}
          onClick={refresh}
          title="刷新"
        >
          <RefreshCw className={cn("h-4 w-4", isRunning && "animate-spin")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={!isConnected}
          onClick={() => navigateTo("https://sellercentral.amazon.com")}
          title="Amazon Seller Central"
        >
          <Home className="h-4 w-4" />
        </Button>

        {/* URL 栏 */}
        <div className="flex-1 flex items-center gap-1.5">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigateTo(urlInput);
            }}
            placeholder="输入网址或搜索..."
            className="h-8 text-sm"
            disabled={!isConnected}
          />
          {isRunning && (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600 shrink-0" />
          )}
        </div>

        {/* 操作按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
          title="放大"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
          title="缩小"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={downloadScreenshot}
          disabled={!state.screenshot}
          title="下载截图"
        >
          <Download className="h-4 w-4" />
        </Button>
        {state.currentUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(state.currentUrl!, "_blank")}
            title="在浏览器中打开"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowFullscreen(!showFullscreen)}
          title="全屏"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* 主视图区域 */}
      <div className="flex-1 relative bg-slate-100 overflow-hidden">
        {state.status === "disconnected" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Monitor className="h-16 w-16 text-slate-300" />
            <p className="text-lg font-medium text-slate-500">浏览器未启动</p>
            <p className="text-sm text-slate-400 max-w-md text-center">
              启动浏览器后，你可以远程控制浏览器访问亚马逊、TikTok
              等电商平台，执行自动登录、数据抓取等操作
            </p>
            <div className="flex gap-3 mt-2">
              <Button onClick={() => launch()} className="bg-emerald-600 hover:bg-emerald-700">
                启动空白页
              </Button>
              <Button
                variant="outline"
                onClick={() => launch("https://sellercentral.amazon.com")}
              >
                启动 Amazon
              </Button>
              <Button
                variant="outline"
                onClick={() => launch("https://seller.tiktokglobalshop.com")}
              >
                启动 TikTok Shop
              </Button>
            </div>
          </div>
        )}

        {state.status === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            <p className="text-slate-500">正在启动浏览器...</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <X className="h-6 w-6 text-red-500" />
            </div>
            <p className="font-medium text-red-600">操作失败</p>
            <p className="text-sm text-slate-500 text-center max-w-md">
              {state.error || "未知错误"}
            </p>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={closeBrowser}>
                关闭浏览器
              </Button>
              <Button onClick={() => launch(state.currentUrl || undefined)}>
                重新启动
              </Button>
            </div>
          </div>
        )}

        {isConnected && state.screenshot && (
          <div
            className="h-full w-full overflow-auto"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            <img
              src={`data:image/jpeg;base64,${state.screenshot}`}
              alt="浏览器截图"
              className="min-w-full cursor-crosshair"
              onClick={takeScreenshot}
            />
          </div>
        )}

        {isConnected && !state.screenshot && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            <p className="text-slate-500">正在加载页面...</p>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      {isConnected && (
        <div className="flex items-center justify-between px-3 py-1.5 border-t bg-white text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-1",
                state.status === "connected"
                  ? "text-emerald-600"
                  : state.status === "running"
                  ? "text-amber-600"
                  : "text-slate-500"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  state.status === "connected"
                    ? "bg-emerald-500"
                    : state.status === "running"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-slate-400"
                )}
              />
              {state.status === "connected"
                ? "已连接"
                : state.status === "running"
                ? "执行中"
                : state.status}
            </span>
            <span>缩放: {Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="max-w-md truncate">{state.currentUrl || "-"}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={closeBrowser}
            >
              关闭浏览器
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
