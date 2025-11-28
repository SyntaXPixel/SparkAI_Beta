import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { User, Bot, Code, Sparkles, Bookmark, Share2, Globe } from "lucide-react";
import { toast } from "sonner";
import { Friend } from "../App";
import { Card, CardContent } from "./ui/card";
import { MessageContent } from "./message-content";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  botType?: "chat" | "code" | "sparky" | "explore";
  friends?: Friend[];
  onShareMessage?: (friendId: string, content: string, botType: "chat" | "code" | "sparky" | "explore") => void;
  isStreaming?: boolean;
  userAvatar?: string;
}

export function ChatMessage({ role, content, botType = "chat", friends = [], onShareMessage, isStreaming, userAvatar }: ChatMessageProps) {
  const isUser = role === "user";
  const [showShareDialog, setShowShareDialog] = useState(false);

  const getBotIcon = () => {
    if (isStreaming) {
      return <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />;
    }
    if (botType === "code") return <Code className="h-4 w-4" />;
    if (botType === "sparky") return <Sparkles className="h-4 w-4" />;
    if (botType === "explore") return <Globe className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to save messages");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/saves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          bot_type: botType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      toast.success("Response saved successfully!");
    } catch (error) {
      console.error("Error saving message:", error);
      toast.error("Failed to save message");
    }
  };

  const handleShare = () => {
    if (friends.length === 0) {
      toast.error("You don't have any friends yet. Add friends from the Inbox page!");
      return;
    }
    setShowShareDialog(true);
  };

  const handleShareToFriend = (friendId: string) => {
    if (onShareMessage) {
      onShareMessage(friendId, content, botType);
      const friend = friends.find(f => f.id === friendId);
      toast.success(`Shared to ${friend?.name}!`);
      setShowShareDialog(false);
    }
  };

  return (
    <>
      <div className={`flex gap-4 p-6 ${isUser ? "bg-background" : "bg-card"} group`}>
        <Avatar className={`h-8 w-8 ${isUser ? "bg-muted" : "bg-primary"}`}>
          {isUser && userAvatar ? (
            <img src={userAvatar} alt="User" className="h-full w-full object-cover" />
          ) : (
            <AvatarFallback className={isUser ? "text-foreground bg-muted" : "text-primary-foreground bg-primary"}>
              {isUser ? <User className="h-4 w-4" /> : getBotIcon()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 space-y-3">
          {isStreaming && !content ? (
            <div className="flex gap-1 h-6 items-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <MessageContent content={content} />
          )}
          {!isUser && botType !== "sparky" && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="text-muted-foreground hover:text-foreground"
              >
                <Bookmark className="h-3 w-3 mr-1.5" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-3 w-3 mr-1.5" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Share to Friend Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share with Friends</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            <p className="text-muted-foreground">Select a friend to share this AI response:</p>
            {friends.map((friend) => (
              <Card
                key={friend.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleShareToFriend(friend.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">{friend.name}</p>
                      <p className="text-muted-foreground">ID: {friend.userId}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1.5" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
