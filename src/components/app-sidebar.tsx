import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Home, MessageSquare, Code, ListTodo, Sparkles, User, Inbox, Bookmark, Info, Menu, Globe } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";


export type NavigationItem = "home" | "chat" | "code" | "explore" | "todo" | "sparky" | "profile" | "inbox" | "saves" | "about";

interface AppSidebarProps {
  currentPage: NavigationItem;
  onNavigate: (page: NavigationItem) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const topNavItems = [
  { id: "home" as NavigationItem, label: "Home", icon: Home },
  { id: "chat" as NavigationItem, label: "Chat", icon: MessageSquare },
  { id: "code" as NavigationItem, label: "Code", icon: Code },
  { id: "explore" as NavigationItem, label: "Explore", icon: Globe },
  { id: "todo" as NavigationItem, label: "To do list", icon: ListTodo },
  { id: "sparky" as NavigationItem, label: "Sparky", icon: Sparkles },
];

const bottomNavItems = [
  { id: "profile" as NavigationItem, label: "Profile", icon: User },
  { id: "inbox" as NavigationItem, label: "Inbox", icon: Inbox },
  { id: "saves" as NavigationItem, label: "Saves", icon: Bookmark },
  { id: "about" as NavigationItem, label: "About", icon: Info },
];

export function AppSidebar({ currentPage, onNavigate, isOpen, onClose, onOpen }: AppSidebarProps) {
  const toggleSidebar = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  return (
    <TooltipProvider>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-card border-r border-border
        flex flex-col
        transition-all duration-300
        ${isOpen ? 'w-64' : 'w-16'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className={`p-4 border-b border-border flex items-center justify-between`}>
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                <svg
                  width="800px"
                  height="800px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-foreground transition-all duration-300"
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
              <p className="font-bold transition-colors duration-300 text-foreground" style={{ fontWeight: '500', fontSize: '22px', letterSpacing: '0.8px', fontFamily: 'Lato' }}>
                Spark
                <span className="font-bold" style={{ marginTop: '2px', marginLeft: '2.8px', fontWeight: '500', fontSize: '22px', color: '#ff1df0db', letterSpacing: '0.8px', fontFamily: 'Lato' }}>A</span>
                <span className="font-bold" style={{ marginTop: '2px', fontWeight: '500', fontSize: '22px', color: '#007fd4ff', letterSpacing: '0.8px', fontFamily: 'Lato' }}>I</span>
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className={`${isOpen ? 'p-3' : 'p-2'} space-y-1`}>
            {topNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              if (!isOpen) {
                return (
                  <Tooltip key={item.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-full ${isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""
                          }`}
                        onClick={() => {
                          onNavigate(item.id);
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start ${isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""
                    }`}
                  onClick={() => {
                    onNavigate(item.id);
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="border-t border-border">
          <div className={`${isOpen ? 'p-3' : 'p-2'} space-y-1`}>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              if (!isOpen) {
                return (
                  <Tooltip key={item.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-full ${isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""
                          }`}
                        onClick={() => {
                          onNavigate(item.id);
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start ${isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""
                    }`}
                  onClick={() => {
                    onNavigate(item.id);
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}