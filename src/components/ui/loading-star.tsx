import React from "react";

export function LoadingStar({ className = "h-16 w-16" }: { className?: string }) {
    return (
        <div className="flex justify-center items-center h-full w-full">
            <div className="animate-blink">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${className} text-foreground`}
                >
                    <path
                        d="M12 3C12 7.97056 16.0294 12 21 12C16.0294 12 12 16.0294 12 21C12 16.0294 7.97056 12 3 12C5.6655 12 8.06036 10.8412 9.70832 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    );
}
