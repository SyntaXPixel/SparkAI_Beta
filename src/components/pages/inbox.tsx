import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Users, UserPlus, MessageSquare, Send as SendIcon, Trash2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Friend, SharedMessage } from "../../App";
import { MessageContent } from "../message-content";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface InboxPageProps {
  friends: Friend[];
  sharedMessages: SharedMessage[];
  onAddFriend: (name: string, userId: string) => Promise<boolean>;
  currentUserId?: string;
  onDeleteMessage?: (messageId: string) => void;
}

export function InboxPage({ friends, sharedMessages, onAddFriend, currentUserId, onDeleteMessage }: InboxPageProps) {
  const [showFriends, setShowFriends] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendId, setNewFriendId] = useState("");

  const handleAddFriend = async () => {
    if (!newFriendId.trim()) {
      toast.error("Please enter Spark ID");
      return;
    }

    const success = await onAddFriend("", newFriendId.trim());

    if (success) {
      setNewFriendId("");
      setShowAddFriend(false);
    }
  };

  const handleSave = async (content: string, botType: "chat" | "code" | "sparky" | "explore") => {
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

      toast.success("Message saved successfully!");
    } catch (error) {
      console.error("Error saving message:", error);
      toast.error("Failed to save message");
    }
  };

  const receivedMessages = sharedMessages.filter(msg => msg.toUserId === currentUserId);
  const sentMessages = sharedMessages.filter(msg => msg.fromUserId === currentUserId);

  const formatTimestamp = (timestamp: string) => {
    // Ensure timestamp is treated as UTC
    const timeString = timestamp.endsWith("Z") ? timestamp : timestamp + "Z";
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getBotLabel = (botType: "chat" | "code" | "sparky" | "explore") => {
    if (botType === "code") return "Code Assistant";
    if (botType === "sparky") return "Sparky";
    if (botType === "explore") return "Explore";
    return "Chat Assistant";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-muted-foreground">Inbox</h1>
          <p className="text-muted-foreground">
            Manage shared AI responses and friends
          </p>
        </div>
        <Dialog open={showFriends} onOpenChange={setShowFriends}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Users className="h-4 w-4 mr-2" />
              Friends ({friends.length})
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Friends List</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {friends.map((friend) => (
                <Card key={friend.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">{friend.name}</p>
                        <p className="text-muted-foreground">ID: {friend.userId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {friends.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No friends yet. Add some friends to start sharing!
                </p>
              )}
            </div>
            <DialogFooter>
              <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Friend
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Friend</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userId">Spark ID</Label>
                      <Input
                        id="userId"
                        placeholder="Enter friend's Spark ID (e.g. SPK123456)"
                        value={newFriendId}
                        onChange={(e) => setNewFriendId(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddFriend(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddFriend}>Add Friend</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for Received and Sent */}
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">
            <MessageSquare className="h-4 w-4 mr-2" />
            Received ({receivedMessages.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            <SendIcon className="h-4 w-4 mr-2" />
            Sent ({sentMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4 mt-6">
          {receivedMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No received messages yet</p>
            </div>
          ) : (
            receivedMessages.map((message) => (
              <Card key={message.id} className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>{message.fromUserName?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-foreground flex items-center gap-2">
                            From: {message.fromUserName}
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {message.fromUserId}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            {getBotLabel(message.botType)} • {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleSave(message.content, message.botType)}
                          title="Save to Saved Items"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        {onDeleteMessage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDeleteMessage(message.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <MessageContent content={message.content} className="pl-10 smooth-expand" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4 mt-6">
          {sentMessages.length === 0 ? (
            <div className="text-center py-12">
              <SendIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sent messages yet</p>
              <p className="text-muted-foreground mt-2">
                Share AI responses with your friends from the chat pages
              </p>
            </div>
          ) : (
            sentMessages.map((message) => (
              <Card key={message.id} className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={message.receiverAvatar} />
                          <AvatarFallback>{message.toUserName?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-foreground flex items-center gap-2">
                            To: {message.toUserName}
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {message.toUserId}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            {getBotLabel(message.botType)} • {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleSave(message.content, message.botType)}
                          title="Save to Saved Items"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        {onDeleteMessage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDeleteMessage(message.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <MessageContent content={message.content} className="pl-10 smooth-expand" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
