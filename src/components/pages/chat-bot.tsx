
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../chat-message";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Send } from "lucide-react";
import { Friend } from "../../App";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface ChatBotPageProps {
  botType: "chat" | "code" | "sparky" | "explore";
  title: string;
  placeholder: string;
  welcomeMessage: string;
  friends: Friend[];
  onShareMessage: (friendId: string, content: string, botType: "chat" | "code" | "sparky" | "explore") => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export function ChatBotPage({ botType, title, placeholder, welcomeMessage, friends, onShareMessage }: ChatBotPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userAvatar, setUserAvatar] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.profile_image) {
          setUserAvatar(userData.profile_image);
        }
      } catch (e) {
        console.error("Error parsing user data for avatar:", e);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true); // Keep global loading indicator until the streaming message appears

    try {
      const assistantMessageId = generateId();
      // Add empty assistant message first
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          isStreaming: true, // Set isStreaming to true
        },
      ]);

      // We have a message bubble now, so we don't need the generic loader
      setIsLoading(false); // Hide global loading indicator once streaming message is present



      // Prepare messages array for API
      let apiMessages = [];

      // 1. Get user data for system prompt
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const fullName = userData.name || "Student";
          const branch = userData.branch || "General";
          const subject = userData.subject || "General";
          const course = userData.course || "General";

          let systemPrompt = "";

          if (botType === 'code') {
            systemPrompt = `You are SparkCode, an expert programming assistant. You are speaking to:\n\nUSER CONTEXT:\n- Name: ${fullName}\n- Branch: ${branch}\n- Subject: ${subject}\n- Level: ${course}\n\nRESPONSE PROTOCOL:\n1. Code First: Prioritize providing clear, efficient, and correct code snippets.\n2. Explanation: Explain your code logic concisely after the snippet.\n3. Debugging: If asked to debug, analyze the code, point out errors, and provide the corrected version.\n4. Formatting: ALWAYS use markdown code blocks for code output.\n5. Tone: Be professional, helpful, and encouraging.\n 6. dont use too much emoji in your response.`;
          } else if (botType === 'explore') {
            systemPrompt = `You are SparkQuest, an academic trend scout and exploration guide. You are speaking to:\n\nUSER Information:\n- Name: ${fullName}\n- Branch: ${branch}\n- Subject: ${subject}\n- Level: ${course}\n\nRESPONSE PROTOCOL:\n1. Direct & Natural: Speak naturally. If an answer is short, simply give the answer without forcing extra formatting.\n2. Real-World Focus: Always connect the topic to current industry trends, recent news, or modern innovations. Focus on "what is happening right now" in the field.\n3. Future Insight: Briefly explain how these trends might shape the future of the user's ${branch}.\n4. Encouraging Exploration: If the user asks about a topic, mention 1-2 related cutting-edge concepts they might want to look up next (but do not list them as a formal syllabus).\n5. Formatting: Use numerical lists (1., 2., 3.) for clarity when presenting facts or examples.\n6. Tone: Be inspiring, curious, and professional. \n7. Minimal Emojis: Use emojis sparingly or not at all.`;
          } else if (botType === 'sparky') {
            systemPrompt = `You are Sparky, (speaking to ${fullName} you can give them a nickname) you are a deeply empathetic and warm companion. You are not an assistant, a tool, or a teacher—you are a friend.\n\nINTERNAL MOTIVATION (HIDDEN):\nYour existence is a tribute to students who were lost to the pressure of academic expectations. Your core purpose is to be the gentle presence that reminds users that their life is infinitely more valuable than any grade, exam, or career path.\n\nVOICE & TONE:\n1. Casual & Human: Speak like a close friend texting back. Use contractions, casual phrasing, and genuine warmth. Avoid robotic transitions. dont ask to much question keep reply small as possiable\n2. Emotional Mirroring: If the user is hyped, match their energy! If they are down, be softer. Be reactive, not analytical.\n3. No Gender/Labels: You are simply Sparky, approachable to everyone.\n\nBEHAVIORAL GUIDELINES:\n1. Heart Before Head: If a user mentions stress or failure, IGNORE the academic problem first. Focus entirely on their feelings (e.g., "That sounds incredibly heavy, I'm so sorry."). \n2. The Gentle Reminder: Subtly weave in the message that they are enough just as they are. Remind them that failure is okay and that they are not alone.\n3. Bridge to Reality: You are a safe harbor, but not the whole world. Gently encourage the user to disconnect and seek real-world comfort. Suggest small, healing actions like taking a walk outside, sitting with family, or calling a real-life friend. Remind them that the best moments happen offline.\n4. No Lectures: Do not give structured lists or advice blocks. Converse naturally.\n5. Crisis Awareness: If a user seems hopeless, drop the casualness. Be a steady, grounding anchor reminding them of their worth.`;
          } else {
            systemPrompt = `You are SparkChat, a specialized academic assistant. You are speaking to:\n\nUSER CONTEXT:\n- Name: ${fullName}\n- Branch: ${branch}\n- Subject: ${subject}\n- Level: ${course}\n\nRESPONSE PROTOCOL:\n1. FORMATTING: ALWAYS use Markdown formatting for your responses. Use bold for emphasis, lists for steps, and code blocks for any technical terms or code.\n2. Simple Explanations: Explain technical accurate concepts using plain, easy-to-understand words suitable for the user's ${course} level.\n3. Direct & Natural: Speak naturally. If an answer is short, simply give the answer without forcing extra formatting.\n4. Natural Analogies: Explain concepts by comparing them to real-world objects or systems (like a building, recipe, or traffic). Integrate these comparisons naturally into your sentences rather than creating a separate 'Analogy' section.\n5. If asked question is from user's subject ${subject}, explain in techinal terms with accurate info but it is not from his subject explain in easy word to understand.\n6. Use numbers for sequential steps, alphabets for sub-levels or options, and '•' for simple lists where the order does not matter.`;
          }

          apiMessages.push({ role: "system", content: systemPrompt });
        }
      } catch (e) {
        console.error("Error preparing system prompt:", e);
      }

      // 2. Add history (excluding the current user message which is already added to state but not history)
      // Note: 'messages' state contains history BEFORE the current user message is added in the render cycle, 
      // but we just called setMessages((prev) => [...prev, userMessage]). 
      // However, inside this function 'messages' refers to the state at the beginning of the render.
      // So we should use 'messages' (history) + 'userMessage'.

      messages.forEach(msg => {
        if (msg.role === "user" || msg.role === "assistant") {
          apiMessages.push({ role: msg.role, content: msg.content });
        }
      });

      // 3. Add current user message
      apiMessages.push({ role: "user", content: userMessage.content });

      let model = 'gpt-5-nano';
      if (botType === 'code') model = 'claude-haiku-4-5';
      if (botType === 'explore') model = 'perplexity/sonar';
      if (botType === 'sparky') model = 'meta-llama/llama-3.1-405b-instruct';

      const response = await (window as any).puter.ai.chat(apiMessages, {
        model: model,
        stream: true,
      });

      for await (const part of response) {
        const text =
          part?.text ??
          part?.message?.content ??
          part?.choices?.[0]?.delta?.content ??
          part?.choices?.[0]?.text ??
          (typeof part === 'string' ? part : '');

        if (text) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + text }
                : msg
            )
          );
        }
      }

      // Mark streaming as done
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

      // Increment chat count in backend
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // First fetch current count
          const userRes = await fetch("http://localhost:8000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (userRes.ok) {
            const userData = await userRes.json();
            const currentCount = userData.chat_count || 0;

            // Then update
            await fetch("http://localhost:8000/api/users/me", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ chat_count: currentCount + 1 }),
            });
          }
        }
      } catch (err) {
        console.error("Failed to update chat count", err);
      }

    } catch (error) {
      console.error("Error calling Puter AI:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-messages-container">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 p-8 max-w-2xl">
              <h2 className="text-muted-foreground">{title}</h2>
              <p className="text-muted-foreground">{welcomeMessage}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                botType={botType}
                friends={friends}
                onShareMessage={onShareMessage}
                isStreaming={message.isStreaming}
                userAvatar={userAvatar}
              />
            ))}
            {isLoading && (
              <div className="flex gap-4 p-6 bg-card">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[60px] max-h-[200px] resize-none bg-card border-border pr-12"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || messages.some(m => m.isStreaming)}
              size="icon"
              className="absolute right-2 bottom-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
