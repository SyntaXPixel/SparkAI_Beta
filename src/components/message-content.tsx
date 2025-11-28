import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from "./ui/utils";
import { Check, Copy } from "lucide-react";

interface MessageContentProps {
    content: string;
    className?: string;
    disableMarkdown?: boolean;
}

export function MessageContent({ content, className, disableMarkdown }: MessageContentProps) {
    if (disableMarkdown) {
        return (
            <div className={cn("whitespace-pre-wrap text-foreground", className)}>
                {content}
            </div>
        );
    }

    return (
        <div className={cn("prose dark:prose-invert max-w-none break-words", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeContent = String(children).replace(/\n$/, '');

                        if (!inline && match) {
                            return (
                                <CodeBlock
                                    language={match[1]}
                                    code={codeContent}
                                />
                            );
                        }

                        // Handle code blocks without language specified (treat as block if multiline or not inline)
                        if (!inline && codeContent.includes('\n')) {
                            return (
                                <CodeBlock
                                    language="text"
                                    code={codeContent}
                                />
                            );
                        }

                        return (
                            <code className={cn("bg-muted px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Style other elements to match the theme if needed, or rely on tailwind typography (prose)
                    p({ children }) {
                        return <p className="mb-1 last:mb-0 leading-normal">{children}</p>;
                    },
                    ul({ children }) {
                        return <ul className="list-disc pl-5 mb-1 space-y-0.5">{children}</ul>;
                    },
                    ol({ children }) {
                        return <ol className="list-decimal pl-5 mb-1 space-y-0.5">{children}</ol>;
                    },
                    li({ children }) {
                        return <li className="leading-normal">{children}</li>;
                    },
                    h1({ children }) {
                        return <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>;
                    },
                    h2({ children }) {
                        return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>;
                    },
                    h3({ children }) {
                        return <h3 className="text-base font-bold mb-1 mt-2">{children}</h3>;
                    },
                    blockquote({ children }) {
                        return <blockquote className="border-l-4 border-primary/50 pl-4 italic my-2">{children}</blockquote>;
                    },
                    a({ href, children }) {
                        return <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>;
                    },
                    table({ children }) {
                        return <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-border border border-border rounded-md">{children}</table></div>;
                    },
                    th({ children }) {
                        return <th className="px-3 py-1.5 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</th>;
                    },
                    td({ children }) {
                        return <td className="px-3 py-1.5 whitespace-nowrap text-sm border-t border-border">{children}</td>;
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="relative my-4 rounded-md bg-muted/50 border border-border overflow-hidden group">
            <div className="flex items-center justify-between px-4 py-1.5 bg-muted border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                    {language || 'text'}
                </span>
                <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground"
                    title="Copy code"
                >
                    {isCopied ? (
                        <Check className="h-3 w-3" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </button>
            </div>
            <div className="p-4 overflow-x-auto bg-black/5 dark:bg-black/20">
                <pre className="text-sm font-mono text-foreground">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
}
