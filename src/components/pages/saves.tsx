import { useState, useEffect } from "react";
import { LoadingStar } from "../ui/loading-star";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bookmark, Trash2, Share2, MessageSquare, Code, Sparkles, Copy, Globe } from "lucide-react";
import { toast } from "sonner";
import { MessageContent } from "../message-content";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Friend } from "../../App";

interface SavedItem {
  id: string;
  content: string;
  bot_type: "chat" | "code" | "sparky" | "explore";
  created_at: string;
}

interface SavesPageProps {
  friends: Friend[];
  onShareMessage: (friendId: string, content: string, botType: "chat" | "code" | "sparky" | "explore") => void;
}

export function SavesPage({ friends = [], onShareMessage }: SavesPageProps) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedItemToShare, setSelectedItemToShare] = useState<SavedItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/api/saves", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch saved items", error);
      toast.error("Failed to load saved items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/saves/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSavedItems(savedItems.filter(item => item.id !== id));
        toast.success("Item removed from saves");
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const getBotIcon = (botType: "chat" | "code" | "sparky" | "explore") => {
    if (botType === "code") return <Code className="h-4 w-4" />;
    if (botType === "sparky") return <Sparkles className="h-4 w-4" />;
    if (botType === "explore") return <Globe className="h-4 w-4" />;
    return <MessageSquare className="h-4 w-4" />;
  };

  const getTypeColor = (botType: "chat" | "code" | "sparky" | "explore") => {
    if (botType === "code") return "bg-accent text-accent-foreground hover:bg-accent/80";
    if (botType === "sparky") return "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90";
    if (botType === "explore") return "bg-green-600 text-white hover:bg-green-700";
    return "bg-primary text-primary-foreground hover:bg-primary/90";
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleShareClick = (item: SavedItem) => {
    if (friends.length === 0) {
      toast.error("You don't have any friends yet. Add friends from the Inbox page!");
      return;
    }
    setSelectedItemToShare(item);
    setShowShareDialog(true);
  };

  const handleShareToFriend = (friendId: string) => {
    if (onShareMessage && selectedItemToShare) {
      onShareMessage(friendId, selectedItemToShare.content, selectedItemToShare.bot_type);
      const friend = friends.find(f => f.id === friendId);
      toast.success(`Shared to ${friend?.name}!`);
      setShowShareDialog(false);
      setSelectedItemToShare(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  if (isLoading) {
    return <LoadingStar />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-muted-foreground">Saved Items</h1>
          <p className="text-muted-foreground">
            You have {savedItems.length} saved item{savedItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Bookmark className="h-8 w-8 text-primary" />
      </div>

      {/* Saved Items */}
      <div className="space-y-4">
        {savedItems.map((item) => (
          <Card key={item.id} className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(item.bot_type)}>
                    {getBotIcon(item.bot_type)}
                    <span className="ml-1.5 capitalize">{item.bot_type}</span>
                  </Badge>
                  <span className="text-muted-foreground">{formatDate(item.created_at)}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(item.content)}
                    className="text-muted-foreground hover:text-foreground"
                    title="Copy content"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShareClick(item)}
                    className="text-muted-foreground hover:text-foreground"
                    title="Share with friend"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <MessageContent content={item.content} className="smooth-expand" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {savedItems.length === 0 && (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No saved items yet</p>
          <p className="text-muted-foreground mt-2">
            Save responses from chats to access them later
          </p>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share with Friends</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            <p className="text-muted-foreground">Select a friend to share this saved item:</p>
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
    </div>
  );
}
