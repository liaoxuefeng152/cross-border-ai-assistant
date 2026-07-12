import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '龙掌柜 AI - 跨境电商智能运营平台',
    template: '%s | 龙掌柜 AI',
  },
  description:
    'AI 驱动的跨境电商一站式运营平台。从选品到上架，从素材到分析，让运营效率提升 10 倍。支持 Shopee、Lazada、TikTok Shop、Amazon 多平台。',
  keywords: [
    '跨境电商',
    'AI运营',
    '智能选品',
    'TikTok Shop',
    'Shopee',
    'Lazada',
    'Amazon',
    '商品采集',
    'AI生成图片',
    '跨境电商工具',
  ],
  authors: [{ name: '龙掌柜 AI' }],
  openGraph: {
    title: '龙掌柜 AI - 跨境电商智能运营平台',
    description:
      'AI 驱动，让跨境电商运营效率提升 10 倍。从选品到上架，一个 AI 助手搞定全部。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
