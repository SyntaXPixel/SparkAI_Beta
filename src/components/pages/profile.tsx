import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { LoadingStar } from "../ui/loading-star";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  GitBranch,
  GraduationCap,
  Hash,
  Edit,
  Copy,
  Sparkles,
  Palette,
  Check,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const [profile, setProfile] = useState({
    id: "",
    spark_id: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    branch: "",
    subject: "",
    themeColor: "gradient",
    themeMode: "light",
    profileImage: "",
    createdAt: "",
  });

  const [stats, setStats] = useState({
    chats: 0,
    savedItems: 0,
    daysActive: 0,
  });

  // Temporary state for the modal
  const [tempThemeColor, setTempThemeColor] = useState<string | null>("gradient");
  const [tempThemeMode, setTempThemeMode] = useState<string | null>("light");
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState<string>("");
  const [genderTab, setGenderTab] = useState<"male" | "female">("male");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();

        // Update local storage to keep it in sync
        localStorage.setItem("user", JSON.stringify(userData));

        setProfile({
          id: userData.username || "",
          spark_id: userData.spark_id || "",
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone_number || "",
          course: userData.course || "",
          branch: userData.branch || "",
          subject: userData.subject || "",
          themeColor: userData.theme_color || "gradient",
          themeMode: userData.theme_mode || "light",
          profileImage: userData.profile_image || "",
          createdAt: userData.created_at || "",
        });

        // Calculate Days Active
        if (userData.created_at) {
          const createdDate = new Date(userData.created_at);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setStats(prev => ({ ...prev, daysActive: diffDays }));
        }

        // Set Stats: Chats (from profile)
        setStats(prev => ({ ...prev, chats: userData.chat_count || 0 }));

        // Fetch Stats: Saved Items
        try {
          const savesResponse = await fetch("http://localhost:8000/api/saves", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (savesResponse.ok) {
            const savesData = await savesResponse.json();
            setStats(prev => ({ ...prev, savedItems: savesData.length }));
          }
        } catch (error) {
          console.error("Error fetching saves stats:", error);
        }

      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");

        // Fallback to localStorage if API fails
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setProfile({
              id: userData.username || "",
              spark_id: userData.spark_id || "",
              name: userData.name || "",
              email: userData.email || "",
              phone: userData.phone_number || "",
              course: userData.course || "",
              branch: userData.branch || "",
              subject: userData.subject || "",
              themeColor: userData.theme_color || "gradient",
              themeMode: userData.theme_mode || "light",
              profileImage: userData.profile_image || "",
              createdAt: userData.created_at || "",
            });
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      const updatePayload = {
        name: profile.name,
        course: profile.course,
        branch: profile.branch,
        subject: profile.subject,
      };

      const response = await fetch("http://localhost:8000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update local storage
      const storedUser = localStorage.getItem("user");
      let userData = storedUser ? JSON.parse(storedUser) : {};

      userData = {
        ...userData,
        ...updatePayload,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleOpenThemeModal = () => {
    setTempThemeColor(profile.themeColor);
    setTempThemeMode(profile.themeMode);
    setShowThemeModal(true);
  };

  const handleSaveTheme = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update settings");
        return;
      }

      const updatePayload = {
        theme_color: tempThemeColor,
        theme_mode: tempThemeMode,
      };

      const response = await fetch("http://localhost:8000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        // Optional: Redirect to login or clear session
        // localStorage.removeItem("token");
        // window.location.href = "/login"; 
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update theme settings");
      }

      // Update local storage
      const storedUser = localStorage.getItem("user");
      let userData = storedUser ? JSON.parse(storedUser) : {};

      userData = {
        ...userData,
        ...updatePayload,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setProfile(prev => ({
        ...prev,
        themeColor: tempThemeColor || "gradient",
        themeMode: tempThemeMode || "light",
      }));

      setShowThemeModal(false);
      toast.success("Theme settings saved!");
      window.dispatchEvent(new Event("theme-change"));
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error("Failed to update theme settings");
    }
  };

  const handleSaveProfileImage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update your profile picture");
        return;
      }

      const updatePayload = {
        profile_image: tempProfileImage,
      };

      const response = await fetch("http://localhost:8000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile picture");
      }

      // Update local storage
      const storedUser = localStorage.getItem("user");
      let userData = storedUser ? JSON.parse(storedUser) : {};

      userData = {
        ...userData,
        ...updatePayload,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      setProfile((prev) => ({
        ...prev,
        profileImage: tempProfileImage,
      }));

      setShowProfileImageModal(false);
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) {
    return <LoadingStar />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-muted-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => {
                  setTempProfileImage(profile.profileImage);
                  if (profile.profileImage && profile.profileImage.includes("/girl/")) {
                    setGenderTab("female");
                  } else {
                    setGenderTab("male");
                  }
                  setShowProfileImageModal(true);
                }}
              >
                <Avatar className="h-20 w-20 bg-gradient-to-br from-primary to-accent transition-transform group-hover:scale-105 overflow-hidden">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-white">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  )}
                </Avatar>
                {/* Blur overlay on hover */}
                <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <Edit className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              </div>
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>
                  {profile.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleOpenThemeModal}
              >
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </Button>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() =>
                  isEditing ? handleSave() : setIsEditing(true)
                }
                className={
                  isEditing
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : ""
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="spark_id"
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Spark ID
              </Label>
              <div className="relative">
                <Input
                  id="spark_id"
                  value={profile.spark_id}
                  disabled
                  className="bg-background border-border opacity-70 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(profile.spark_id, "Spark ID")}
                  className="absolute right-0 top-0 h-full"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="id"
                className="flex items-center gap-2"
              >
                <Hash className="h-4 w-4" />
                Username
              </Label>
              <div className="relative">
                <Input
                  id="id"
                  value={profile.id}
                  disabled
                  className="bg-background border-border opacity-70 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(profile.id, "Username")}
                  className="absolute right-0 top-0 h-full"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-background border-border opacity-70 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(profile.email, "Email")}
                  className="absolute right-0 top-0 h-full"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  value={profile.phone}
                  disabled
                  className="bg-background border-border opacity-70 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(profile.phone, "Phone")}
                  className="absolute right-0 top-0 h-full"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="course"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Course
              </Label>
              <Input
                id="course"
                value={profile.course}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    course: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="branch"
                className="flex items-center gap-2"
              >
                <GitBranch className="h-4 w-4" />
                Branch
              </Label>
              <Input
                id="branch"
                value={profile.branch}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    branch: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="subject"
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Subject
              </Label>
              <Input
                id="subject"
                value={profile.subject}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    subject: e.target.value,
                  })
                }
                disabled={!isEditing}
                className="bg-background border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-foreground">{stats.chats}</p>
            <p className="text-muted-foreground">Chats</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-foreground">{stats.savedItems}</p>
            <p className="text-muted-foreground">Saved Items</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-foreground">{stats.daysActive}</p>
            <p className="text-muted-foreground">Days Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Theme Customization Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className="rounded-lg bg-background p-6 shadow-2xl border border-border relative animate-in zoom-in-95 duration-200"
            style={{ width: '600px', maxWidth: '90vw' }}
          >
            <button
              onClick={() => setShowThemeModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-6 text-center">Customize Appearance</h2>

            <div className="space-y-6">
              {/* Color Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Accent Color</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {/* Gradient */}
                  <div
                    className={`h-20 rounded-lg cursor-pointer relative flex items-center justify-center transition-all hover:-translate-y-0.5 ${tempThemeColor === 'gradient' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md' : 'hover:shadow-sm'}`}
                    style={{ background: 'linear-gradient(135deg, #a85cff, #2591d9)' }}
                    onClick={() => setTempThemeColor('gradient')}
                  >
                    {tempThemeColor === 'gradient' && <Check className="text-white h-6 w-6 drop-shadow-md" />}
                  </div>

                  {/* Purple */}
                  <div
                    className={`h-20 rounded-lg cursor-pointer relative flex items-center justify-center transition-all hover:-translate-y-0.5 ${tempThemeColor === 'purple' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md' : 'hover:shadow-sm'}`}
                    style={{ background: '#a85cff' }}
                    onClick={() => setTempThemeColor('purple')}
                  >
                    {tempThemeColor === 'purple' && <Check className="text-white h-6 w-6 drop-shadow-md" />}
                  </div>

                  {/* Blue */}
                  <div
                    className={`h-20 rounded-lg cursor-pointer relative flex items-center justify-center transition-all hover:-translate-y-0.5 ${tempThemeColor === 'blue' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md' : 'hover:shadow-sm'}`}
                    style={{ background: '#2591d9' }}
                    onClick={() => setTempThemeColor('blue')}
                  >
                    {tempThemeColor === 'blue' && <Check className="text-white h-6 w-6 drop-shadow-md" />}
                  </div>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">System Mode</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {/* Light */}
                  <div
                    className={`h-20 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-3 border transition-all hover:border-primary hover:bg-accent/5 ${tempThemeMode === 'light' ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-accent/10' : 'border-border bg-card'}`}
                    onClick={() => setTempThemeMode('light')}
                  >
                    <Sun className="h-6 w-6" />
                    <span className="font-medium text-sm">Light</span>
                  </div>

                  {/* Dark */}
                  <div
                    className={`h-20 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-3 border transition-all hover:border-primary hover:bg-accent/5 ${tempThemeMode === 'dark' ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-accent/10' : 'border-border bg-card'}`}
                    onClick={() => setTempThemeMode('dark')}
                  >
                    <Moon className="h-6 w-6" />
                    <span className="font-medium text-sm">Dark</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={() => setShowThemeModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTheme}
                className="flex-[2] px-4 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-md"
                style={{ background: 'linear-gradient(to right, #a85cff, #2591d9)' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Selection Modal */}
      {showProfileImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className="rounded-lg bg-background p-6 shadow-2xl border border-border relative animate-in zoom-in-95 duration-200"
            style={{ width: '550px', maxWidth: '95vw' }}
          >
            <button
              onClick={() => setShowProfileImageModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-6 text-center">Choose Profile Picture</h2>

            <Tabs value={genderTab} className="w-full mb-6" onValueChange={(value: string) => setGenderTab(value as "male" | "female")}>
              <TabsList className="w-full flex h-10">
                <TabsTrigger value="male">Male</TabsTrigger>
                <TabsTrigger value="female">Female</TabsTrigger>
              </TabsList>

              <TabsContent value="male">
                <div
                  className="grid gap-4 mb-6 p-4"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
                >
                  {[
                    "/Profiles/boy/Gemini_Generated_Image_fnz7fufnz7fufnz7_1.jpeg",
                    "/Profiles/boy/Gemini_Generated_Image_fnz7fufnz7fufnz7_2.jpeg",
                    "/Profiles/boy/Gemini_Generated_Image_fnz7fufnz7fufnz7_3.jpeg",
                    "/Profiles/boy/Gemini_Generated_Image_g0edojg0edojg0ed_1.jpg",
                    "/Profiles/boy/Gemini_Generated_Image_h0c81nh0c81nh0c8.png",
                    "/Profiles/boy/Gemini_Generated_Image_muo2upmuo2upmuo2_1.png",
                    "/Profiles/boy/Gemini_Generated_Image_muo2upmuo2upmuo2_2.png",
                    "/Profiles/boy/Gemini_Generated_Image_muo2upmuo2upmuo2_3.png",
                  ].map((avatarUrl, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center min-w-0"
                    >
                      <div
                        onClick={() => setTempProfileImage(avatarUrl)}
                        className={`w-20 h-20 rounded-full overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 hover:shadow-lg relative ${tempProfileImage === avatarUrl
                          ? "border-primary ring-4 ring-primary/30 scale-105 shadow-md"
                          : "border-transparent hover:border-primary/50"
                          }`}
                      >
                        <img src={avatarUrl} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                        {tempProfileImage === avatarUrl && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                            <Check className="h-8 w-8 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="female">
                <div
                  className="grid gap-4 mb-6 p-4"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
                >
                  {[
                    "/Profiles/girl/Gemini_Generated_Image_49091j49091j4909_1.png",
                    "/Profiles/girl/Gemini_Generated_Image_580h03580h03580h_1.png",
                    "/Profiles/girl/Gemini_Generated_Image_5kvvgq5kvvgq5kvv_2.png",
                    "/Profiles/girl/Gemini_Generated_Image_9ht7o49ht7o49ht7_1.png",
                    "/Profiles/girl/Gemini_Generated_Image_9ht7o49ht7o49ht7_2.png",
                    "/Profiles/girl/Gemini_Generated_Image_9ht7o49ht7o49ht7_3.png",
                    "/Profiles/girl/Gemini_Generated_Image_9ht7o49ht7o49ht7_4.jpeg",
                    "/Profiles/girl/Gemini_Generated_Image_kpr0k8kpr0k8kpr0_1.png",
                  ].map((avatarUrl, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center min-w-0"
                    >
                      <div
                        onClick={() => setTempProfileImage(avatarUrl)}
                        className={`w-20 h-20 rounded-full overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 hover:shadow-lg relative ${tempProfileImage === avatarUrl
                          ? "border-primary ring-4 ring-primary/30 scale-105 shadow-md"
                          : "border-transparent hover:border-primary/50"
                          }`}
                      >
                        <img src={avatarUrl} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                        {tempProfileImage === avatarUrl && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                            <Check className="h-8 w-8 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3">
              <button
                onClick={() => setShowProfileImageModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfileImage}
                className="flex-[2] px-4 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-md bg-primary"
              >
                Save Profile Picture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}