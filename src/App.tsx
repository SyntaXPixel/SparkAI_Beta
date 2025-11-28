import { useEffect, useState } from "react";
import { AppSidebar, NavigationItem } from "./components/app-sidebar";
import { HomePage } from "./components/pages/home";
import { ChatBotPage } from "./components/pages/chat-bot";
import { TodoPage } from "./components/pages/todo";
import { ProfilePage } from "./components/pages/profile";
import { InboxPage } from "./components/pages/inbox";
import { SavesPage } from "./components/pages/saves";
import { AboutPage } from "./components/pages/about";
import LoginPage from "./components/pages/login";
import SignUpPage from "./components/pages/signup";
import ForgotPasswordPage from "./components/pages/forgot-password";

import { Button } from "./components/ui/button";
import { Menu, Plus } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

export interface Friend {
  id: string;
  name: string;
  userId: string;
  email?: string;
}

export interface SharedMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  senderAvatar?: string;
  toUserId: string;
  toUserName: string;
  receiverAvatar?: string;
  content: string;
  timestamp: string;
  botType: "chat" | "code" | "sparky" | "explore";
}



export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationItem>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sharedMessages, setSharedMessages] = useState<SharedMessage[]>([]);

  const handleNavigate = (page: NavigationItem) => {
    setCurrentPage(page);
  };

  const handleAddFriend = async (_name: string, userId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to add friends");
        return false;
      }

      const response = await fetch("http://localhost:8000/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ spark_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to add friend");
        return false;
      }

      const newFriendData = await response.json();
      const newFriend: Friend = {
        id: newFriendData.id,
        name: newFriendData.name,
        userId: newFriendData.spark_id,
        email: newFriendData.email,
      };
      setFriends([...friends, newFriend]);
      toast.success("Friend added successfully!");
      return true;
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("An error occurred while adding friend");
      return false;
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:8000/api/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const mappedMessages: SharedMessage[] = data.map((msg: any) => ({
          id: msg.id,
          fromUserId: msg.sender_id,
          fromUserName: msg.sender_name,
          senderAvatar: msg.sender_avatar,
          toUserId: msg.receiver_id,
          toUserName: msg.receiver_name,
          receiverAvatar: msg.receiver_avatar,
          content: msg.content,
          timestamp: msg.timestamp,
          botType: msg.bot_type,
        }));
        setSharedMessages(mappedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleShareMessage = async (friendId: string, content: string, botType: "chat" | "code" | "sparky" | "explore") => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to share messages");
        return;
      }

      const response = await fetch("http://localhost:8000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_spark_id: friend.userId,
          content,
          bot_type: botType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message shared successfully!");
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error("Error sharing message:", error);
      toast.error("Failed to share message");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(Boolean(token));
    setIsAuthChecked(true);
  }, []);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:8000/api/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const mappedFriends: Friend[] = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          userId: f.spark_id,
          email: f.email,
        }));
        setFriends(mappedFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFriends();
      fetchMessages();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const applyTheme = () => {
      // Remove all theme classes first
      document.body.classList.remove(
        "light-blue",
        "dark-blue",
        "light-purple",
        "dark-purple",
        "light-gradient",
        "dark-gradient"
      );

      if (!isAuthenticated) return;

      const storedUser = localStorage.getItem("user");
      let themeColor = "gradient";
      let themeMode = "light";

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          themeColor = userData.theme_color || "gradient";
          themeMode = userData.theme_mode || "light";
        } catch (e) {
          console.error("Error parsing user data for theme:", e);
        }
      }

      let themeClass = "";
      if (themeColor === "blue") {
        themeClass = themeMode === "light" ? "light-blue" : "dark-blue";
      } else if (themeColor === "purple") {
        themeClass = themeMode === "light" ? "light-purple" : "dark-purple";
      } else {
        // gradient
        themeClass = themeMode === "light" ? "light-gradient" : "dark-gradient";
      }

      // Add the new theme class
      document.body.classList.add(themeClass);

      // Handle dark mode class for Tailwind if needed
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Apply on mount and when auth changes
    applyTheme();

    // Listen for changes
    window.addEventListener("theme-change", applyTheme);
    return () => window.removeEventListener("theme-change", applyTheme);
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentPage("home");
  };

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [isAuthenticated]);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Message deleted");
        fetchMessages();
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Error deleting message");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "chat":
        return (
          <ChatBotPage
            botType="chat"
            title="Chat Assistant"
            placeholder="Ask me anything..."
            welcomeMessage="I'm your general chat assistant. Ask me anything and I'll do my best to help!"
            friends={friends}
            onShareMessage={handleShareMessage}
            key={chatKey}
          />
        );
      case "code":
        return (
          <ChatBotPage
            botType="code"
            title="Code Assistant"
            placeholder="Describe your coding question or paste your code..."
            welcomeMessage="I'm your coding assistant. I can help with programming questions, debugging, and code generation!"
            friends={friends}
            onShareMessage={handleShareMessage}
            key={chatKey}
          />
        );
      case "explore":
        return (
          <ChatBotPage
            botType="explore"
            title="Explore"
            placeholder="Ask about trends, news, or research..."
            welcomeMessage="I'm SparkQuest. Let's explore the latest trends and developments in your field!"
            friends={friends}
            onShareMessage={handleShareMessage}
            key={chatKey}
          />
        );
      case "sparky":
        return (
          <ChatBotPage
            botType="sparky"
            title="Sparky - Creative Assistant"
            placeholder="Share your creative challenge or idea..."
            welcomeMessage="✨ I'm Sparky! Let's explore creative ideas and innovative solutions together!"
            friends={friends}
            onShareMessage={handleShareMessage}
            key={chatKey}
          />
        );
      case "todo":
        return <TodoPage />;
      case "profile":
        return <ProfilePage />;
      case "inbox":
        return <InboxPage friends={friends} sharedMessages={sharedMessages} onAddFriend={handleAddFriend} currentUserId={currentUser?.spark_id} onDeleteMessage={handleDeleteMessage} />;
      case "saves":
        return <SavesPage friends={friends} onShareMessage={handleShareMessage} />;
      case "about":
        return <AboutPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "home":
        return "Home";
      case "chat":
        return "Chat Agent";
      case "code":
        return "Code Engine";
      case "explore":
        return "Explore";
      case "sparky":
        return "Sparky";
      case "todo":
        return "To-Do List";
      case "profile":
        return "Profile";
      case "inbox":
        return "Inbox";
      case "saves":
        return "Saved Items";
      case "about":
        return "About";
      default:
        return "Home";
    }
  };

  if (!isAuthChecked) {
    return null;
  }

  if (!isAuthenticated) {
    if (showForgotPassword) {
      return (
        <ForgotPasswordPage
          onBackToLogin={() => {
            setShowForgotPassword(false);
            setShowSignup(false);
          }}
        />
      );
    }

    return (
      <div className={`auth-container ${showSignup ? 'show-signup' : 'show-login'}`}>
        <div className={`auth-page login-page ${!showSignup ? 'active' : ''}`}>
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateToSignup={() => setShowSignup(true)}
            onNavigateToForgotPassword={() => setShowForgotPassword(true)}
          />
        </div>
        <div className={`auth-page signup-page ${showSignup ? 'active' : ''}`}>
          <SignUpPage
            onSignUpSuccess={handleLoginSuccess}
            onNavigateToLogin={() => setShowSignup(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Toaster />

      <AppSidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center gap-3 flex-shrink-0 bg-background z-10">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="flex-1">{getPageTitle()}</h1>
          {(currentPage === "chat" || currentPage === "code" || currentPage === "sparky" || currentPage === "explore") && (
            <div className="group relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/20"
                onClick={() => setChatKey(prevKey => prevKey + 1)}
              >
                <Plus className="h-5 w-5 text-primary" />
              </Button>
              <span className="absolute right-0 top-full mt-2 whitespace-nowrap rounded bg-primary px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                New Chat
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>

        {/* Page Content */}
        <div className={`flex-1 ${['chat', 'code', 'sparky', 'explore'].includes(currentPage) ? 'overflow-hidden' : 'overflow-auto'}`}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}