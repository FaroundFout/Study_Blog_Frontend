import { EmptyState } from "@/components/common/empty-state";

export default function NotFound() {
  return (
    <div className="py-20">
      <EmptyState
        title="这里暂时还没有找到内容"
        description="可能是链接地址有变化，也可能这篇内容还没发布。我们先回首页继续逛逛。"
        actionHref="/"
        actionLabel="返回首页"
      />
    </div>
  );
}
