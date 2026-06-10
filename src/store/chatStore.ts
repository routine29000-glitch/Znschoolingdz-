"use client";
import { create } from "zustand";
import { Message, Conversation } from "@/types";

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isStreaming: boolean;
  selectedSubject: string;
  selectedGrade: string;
  setConversations: (convs: Conversation[]) => void;
  setCurrentConversation: (conv: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setSelectedSubject: (subject: string) => void;
  setSelectedGrade: (grade: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isStreaming: false,
  selectedSubject: "",
  selectedGrade: "",
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (currentConversation) => set({ currentConversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        };
      }
      return { messages };
    }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
  setSelectedGrade: (selectedGrade) => set({ selectedGrade }),
  clearChat: () => set({ messages: [], currentConversation: null }),
}));
