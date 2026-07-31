"use client";

// ============================================================
// 浏览器自动化 - 仪表盘页面
// 完整的浏览器控制界面：截图 + 控制面板 + 执行日志
// ============================================================

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Globe,
  Zap,
  Terminal,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Lightbulb,
} from "lucide-react";
import { BrowserView } from "@/components/browser/browser-view";
import { BrowserControls } from "@/components/browser/browser-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  action: string;
  status: "success" | "error" | "running";
  message: string;
  timestamp: number;
  data?: Record<string, unknown> | null;
}

export default function BrowserPage() {
  const browserRef = useRef<{ executeAction: (action: string, params: Record<string, unknown>) => void }>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiCommand, setAiCommand] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<unknown>(null);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "timestamp">) => {
    setLogs((prev) => [
      {
        ...entry,
        id: Math.random().toString(36).slice(2, 9),
        timestamp: Date.now(),
      },
      ...prev.slice(0, 99), // 最多 100 条
    ]);
  }, []);

  const handleActionComplete = useCallback(
    (result: unknown) => {
      const r = result as { success: boolean; action: string; error?: string; data?: unknown };
      if (r) {
        addLog({
          action: r.action,
          status: r.success ? "success" : "error",
          message: r.success ? `${r.action} 完成` : r.error || "操作失败",
          data: (r.data as Record<string, unknown>) || undefined,
        });
        if (r.data) {
          setExtractedData(r.data);
        }
      }
    },
    [addLog]
  );

  // AI 指令执行
  const handleAICommand = useCallback(async () => {
    if (!aiCommand.trim()) return;
    setAiLoading(true);
    addLog({ action: "ai-command", status: "running", message: `AI 指令: ${aiCommand}` });

    try {
      const res = await fetch("/api/browser/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "auto", // 需要从 BrowserView 获取
          action: "evaluate",
          params: { script: aiCommand },
        }),
      });
      const data = await res.json();
      if (data.success) {
        addLog({ action: "ai-command", status: "success", message: "AI 指令执行完成", data: data.data });
        setExtractedData(data.data);
      } else {
        addLog({ action: "ai-command", status: "error", message: data.error || "执行失败" });
      }
    } catch (err) {
      addLog({
        action: "ai-command",
        status: "error",
        message: err instanceof Error ? err.message : "网络错误",
      });
    } finally {
      setAiLoading(false);
    }
  }, [aiCommand, addLog]);

  // 快捷任务模板
  const quickTasks = [
    {
      label: "登录 Amazon",
      steps: ["navigate:https://sellercentral.amazon.com"],
      icon: "🅰️",
    },
    {
      label: "查看订单",
      steps: ["navigate:https://sellercentral.amazon.com/orders-v3"],
      icon: "📦",
    },
    {
      label: "查看广告报告",
      steps: ["navigate:https://advertising.amazon.com"],
      icon: "📊",
    },
    {
      label: "登录 TikTok Shop",
      steps: ["navigate:https://seller.tiktokglobalshop.com"],
      icon: "🎵",
    },
  ];

  return (
    <div className="flex h-full">
      {/* 主区域 - 浏览器 + 操作面板 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 浏览器视图 */}
        <div className="flex-1 min-h-0">
          <BrowserView onActionComplete={handleActionComplete} />
        </div>

        {/* 底部 AI 指令输入 */}
        <div className="shrink-0 border-t bg-white px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-xs font-medium text-slate-600 shrink-0">
              AI 指令
            </span>
            <Input
              value={aiCommand}
              onChange={(e) => setAiCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAICommand();
                }
              }}
              placeholder="用自然语言告诉 AI：抓取这个页面的所有商品..."
              className="h-8 text-sm flex-1 border-amber-200 focus-visible:ring-amber-100"
              disabled={aiLoading}
            />
            <Button
              size="sm"
              className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white shrink-0"
              onClick={handleAICommand}
              disabled={aiLoading}
            >
              {aiLoading ? "执行中..." : "发送"}
            </Button>
          </div>
        </div>
      </div>

      {/* 右侧面板 */}
      <div className="w-80 border-l bg-white flex flex-col shrink-0">
        <Tabs defaultValue="controls" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full rounded-none border-b bg-transparent px-2 h-10 shrink-0">
            <TabsTrigger value="controls" className="text-xs flex-1 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              操作
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs flex-1 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              数据
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs flex-1 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              日志
            </TabsTrigger>
          </TabsList>

          {/* 操作面板 */}
          <TabsContent value="controls" className="flex-1 overflow-auto m-0 p-0">
            <div className="p-3">
              {/* 快捷任务 */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  快捷任务
                </p>
                {quickTasks.map((task, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      // TODO: 执行快捷任务
                    }}
                  >
                    <span className="text-base">{task.icon}</span>
                    <span className="flex-1">{task.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t">
              <BrowserControls
                onAction={(action, params) => {
                  addLog({ action, status: "running", message: `执行 ${action}...` });
                  // TODO: 连接 BrowserView 的 executeAction
                }}
                disabled={false}
              />
            </div>
          </TabsContent>

          {/* 数据面板 */}
          <TabsContent value="data" className="flex-1 overflow-auto m-0 p-3">
            {extractedData ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">提取结果</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(extractedData, null, 2)
                      );
                    }}
                  >
                    复制
                  </Button>
                </div>
                <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-auto max-h-96 whitespace-pre-wrap break-all">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Lightbulb className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">暂无提取数据</p>
                <p className="text-xs text-slate-400 mt-1">
                  使用右侧操作面板提取页面数据
                </p>
              </div>
            )}
          </TabsContent>

          {/* 日志面板 */}
          <TabsContent value="logs" className="flex-1 overflow-auto m-0 p-0">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Terminal className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">暂无操作记录</p>
                <p className="text-xs text-slate-400 mt-1">
                  操作浏览器后会在这里显示日志
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 px-3 py-2">
                    {log.status === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    ) : log.status === "error" ? (
                      <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-amber-500 mt-0.5 animate-spin shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="h-4 px-1 text-[10px] font-mono"
                        >
                          {log.action}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{log.message}</p>
                      {log.data != null && (
                        <pre className="text-[10px] text-slate-400 mt-1 bg-slate-50 rounded p-1.5 max-h-20 overflow-hidden">
                          {String(JSON.stringify(log.data, null, 2)).slice(0, 200)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
