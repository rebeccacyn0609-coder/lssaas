import React, { useLayoutEffect, useRef, useState } from 'react';
import { Tag } from 'antd';

interface ModelCapabilityTagsProps {
  tags: string[];
  className?: string;
}

export function ModelCapabilityTags({ tags, className }: ModelCapabilityTagsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || tags.length === 0) {
      setOverflow(false);
      return;
    }

    const checkOverflow = () => {
      setOverflow(container.scrollWidth > container.clientWidth + 1);
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tags]);

  if (tags.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`model-capability-tags${overflow ? ' is-overflow' : ''}${className ? ` ${className}` : ''}`}
    >
      {tags.map((tag) => (
        <Tag key={tag} bordered={false} className="model-capability-tag">
          {tag}
        </Tag>
      ))}
    </div>
  );
}
